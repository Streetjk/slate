#include "startup/setup_flow.h"

#include <esp_log.h>
#include <esp_wifi.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#include <algorithm>
#include <array>
#include <cstring>
#include <string>

#include "events/event_bus.h"
#include "network/sntp.h"
#include "network/wifi.h"
#include "power/shutdown.h"
#include "sync/api_client.h"
#include "utils/mac_utils.h"

namespace {
constexpr char kTag[]                  = "setup_flow";
constexpr int  kSaveSecretRetryCount   = 3;
constexpr int  kSaveSecretRetryDelayMs = 200;
constexpr int  kPreferredWifiTimeoutMs = 8000;
constexpr int  kFallbackWifiTimeoutMs  = 6500;
constexpr int  kHiddenWifiTimeoutMs    = 4500;
constexpr uint16_t kMaxScanRecords     = 24;

std::string RecordSsid(const wifi_ap_record_t& record) {
    std::size_t len = 0;
    while (len < sizeof(record.ssid) && record.ssid[len] != 0)
        ++len;
    return std::string(reinterpret_cast<const char*>(record.ssid), len);
}

bool TryProfile(cred::Credentials& c, std::size_t index, int timeout_ms) {
    if (index >= c.wifi_profile_count)
        return false;
    const auto profile = c.wifi_profiles[index];
    if (profile.ssid.empty())
        return false;

    evt::PostBootStage(BootStage::kWifiConnecting, profile.ssid.c_str());
    ESP_LOGI(kTag, "wifi profile attempt index=%u ssid=%s timeout_ms=%d",
             static_cast<unsigned>(index), profile.ssid.c_str(), timeout_ms);

    if (!Wifi::Get().Connect(profile.ssid, profile.password, timeout_ms)) {
        Wifi::Get().Disconnect();
        return false;
    }

    c.wifi_ssid = profile.ssid;
    c.wifi_pwd  = profile.password;
    if (index != 0 && !cred::PromoteWifiProfile(c, profile.ssid))
        ESP_LOGW(kTag, "wifi profile connected but preference persistence failed ssid=%s", profile.ssid.c_str());
    return true;
}

bool ConnectSavedWifi(cred::Credentials& c) {
    if (c.wifi_profile_count == 0)
        return false;

    std::array<bool, cred::kMaxWifiProfiles> attempted{};
    attempted[0] = true;
    if (TryProfile(c, 0, kPreferredWifiTimeoutMs))
        return true;

    if (c.wifi_profile_count <= 1)
        return false;

    wifi_scan_config_t scan{};
    scan.ssid                 = nullptr;
    scan.bssid                = nullptr;
    scan.channel              = 0;
    scan.show_hidden          = true;
    scan.scan_type            = WIFI_SCAN_TYPE_ACTIVE;
    scan.scan_time.active.min = 0;
    scan.scan_time.active.max = 120;

    esp_err_t scan_err = esp_wifi_scan_start(&scan, true);
    if (scan_err == ESP_OK) {
        uint16_t ap_count = 0;
        esp_wifi_scan_get_ap_num(&ap_count);
        ap_count = std::min<uint16_t>(ap_count, kMaxScanRecords);
        std::array<wifi_ap_record_t, kMaxScanRecords> records{};
        if (ap_count > 0 && esp_wifi_scan_get_ap_records(&ap_count, records.data()) == ESP_OK) {
            std::sort(records.begin(), records.begin() + ap_count,
                      [](const wifi_ap_record_t& a, const wifi_ap_record_t& b) { return a.rssi > b.rssi; });

            for (uint16_t r = 0; r < ap_count; ++r) {
                const std::string visible_ssid = RecordSsid(records[r]);
                if (visible_ssid.empty())
                    continue;
                for (std::size_t i = 1; i < c.wifi_profile_count; ++i) {
                    if (attempted[i] || c.wifi_profiles[i].ssid != visible_ssid)
                        continue;
                    attempted[i] = true;
                    ESP_LOGI(kTag, "wifi saved profile visible index=%u rssi=%d",
                             static_cast<unsigned>(i), static_cast<int>(records[r].rssi));
                    if (TryProfile(c, i, kFallbackWifiTimeoutMs))
                        return true;
                }
            }
        }
    } else {
        ESP_LOGW(kTag, "wifi saved-profile scan failed err=%s", esp_err_to_name(scan_err));
    }

    // Secondary hidden SSIDs cannot be matched by a scan. Give each untried
    // saved profile a short bounded attempt before falling back to setup mode.
    for (std::size_t i = 1; i < c.wifi_profile_count; ++i) {
        if (attempted[i])
            continue;
        if (TryProfile(c, i, kHiddenWifiTimeoutMs))
            return true;
    }
    return false;
}
}  // namespace

namespace setup_flow {

bool TryConnectAndSetup(cred::Credentials& c) {
    if (!ConnectSavedWifi(c)) {
        ESP_LOGW(kTag, "wifi connect failed mode=multi_profile profiles=%u",
                 static_cast<unsigned>(c.wifi_profile_count));
        evt::PostBootStage(BootStage::kWifiFailed);
        return false;
    }

    evt::PostBootStage(BootStage::kSntp);
    sntp::Init();
    api::Init(c.server_url, util::WifiStaMacString(), c.device_secret);

    constexpr int kSntpWaitMs = 10000;
    int waited = 0;
    while (!sntp::TimeSynced() && waited < kSntpWaitMs) {
        vTaskDelay(pdMS_TO_TICKS(200));
        waited += 200;
    }
    if (!sntp::TimeSynced())
        ESP_LOGW(kTag, "sntp sync timeout elapsed_ms=%d impact=https_register_may_fail", kSntpWaitMs);

    if (c.device_secret.empty()) {
        evt::PostBootStage(BootStage::kRegistering);
        api::RegisterResult rr;
        if (!api::Register(rr)) {
            ESP_LOGW(kTag, "register failed reason=server_unreachable");
            evt::PostBootStage(BootStage::kServerUnreachable);
            return false;
        }

        bool saved = false;
        for (int attempt = 1; attempt <= kSaveSecretRetryCount; ++attempt) {
            if (cred::SaveSecret(rr.id, rr.device_secret)) {
                saved = true;
                break;
            }
            ESP_LOGW(kTag, "save secret failed attempt=%d total=%d", attempt, kSaveSecretRetryCount);
            vTaskDelay(pdMS_TO_TICKS(kSaveSecretRetryDelayMs));
        }
        if (!saved) {
            ESP_LOGE(kTag, "save secret fatal action=restart");
            power_shutdown::GracefulRestart();
        }
        c.device_id     = rr.id;
        c.device_secret = rr.device_secret;
        api::SetSecret(rr.device_secret);
        evt::PostBootStage(BootStage::kAwaitingPair, nullptr, rr.pair_code.c_str());
    }
    return true;
}

}  // namespace setup_flow
