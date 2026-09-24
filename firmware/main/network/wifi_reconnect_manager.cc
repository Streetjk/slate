#include "network/wifi_reconnect_manager.h"

#include <esp_log.h>
#include <esp_timer.h>
#include <esp_wifi.h>

#include <algorithm>
#include <array>
#include <cstring>

#include "network/cred_store.h"
#include "network/wifi.h"

namespace {
constexpr char     kTag[]              = "wifi";
constexpr uint32_t kBackoffSec[]       = {2, 5, 10, 20, 40, 80, 120};
constexpr size_t   kBackoffSize        = sizeof(kBackoffSec) / sizeof(kBackoffSec[0]);
constexpr uint16_t kMaxSlowScanRecords = 20;

size_t BoundedSsidLen(const uint8_t ssid[32]) {
    size_t len = 0;
    while (len < 32 && ssid[len] != 0)
        ++len;
    return len;
}

bool SsidEquals(const uint8_t lhs[32], const std::string& rhs) {
    const size_t lhs_len = BoundedSsidLen(lhs);
    return lhs_len == rhs.size() && std::memcmp(lhs, rhs.data(), lhs_len) == 0;
}

bool ApplySavedProfile(wifi_config_t& wc, const cred::WifiProfile& profile) {
    if (profile.ssid.empty() || profile.ssid.size() > sizeof(wc.sta.ssid) ||
        profile.password.size() >= sizeof(wc.sta.password)) {
        return false;
    }
    wc = {};
    std::memcpy(wc.sta.ssid, profile.ssid.data(), profile.ssid.size());
    std::memcpy(wc.sta.password, profile.password.data(), profile.password.size());
    wc.sta.threshold.authmode = WIFI_AUTH_OPEN;
    wc.sta.pmf_cfg.capable    = true;
    wc.sta.pmf_cfg.required   = false;
    return true;
}
}  // namespace

WifiReconnectManager::WifiReconnectManager(Wifi* owner) : owner_(owner) {
}

WifiReconnectManager::~WifiReconnectManager() {
    Stop();
    if (timer_) {
        ESP_ERROR_CHECK_WITHOUT_ABORT(esp_timer_delete(timer_));
        timer_ = nullptr;
    }
}

void WifiReconnectManager::ResetBackoff() {
    backoff_idx_.store(0, std::memory_order_release);
}

void WifiReconnectManager::EnsureTimer() {
    if (timer_)
        return;
    const esp_timer_create_args_t args = {
        .callback              = &OnTimer,
        .arg                   = this,
        .dispatch_method       = ESP_TIMER_TASK,
        .name                  = "wifi_slow_rc",
        .skip_unhandled_events = true,
    };
    ESP_ERROR_CHECK(esp_timer_create(&args, &timer_));
}

void WifiReconnectManager::Schedule() {
    if (!owner_ || !owner_->ReconnectAllowed())
        return;
    EnsureTimer();
    const size_t   idx     = std::min(backoff_idx_.load(std::memory_order_acquire), kBackoffSize - 1);
    const uint32_t seconds = kBackoffSec[idx];
    esp_timer_stop(timer_);
    ESP_ERROR_CHECK(esp_timer_start_once(timer_, static_cast<uint64_t>(seconds) * 1000ULL * 1000ULL));
    if (idx < kBackoffSize - 1)
        backoff_idx_.store(idx + 1, std::memory_order_release);
}

void WifiReconnectManager::Stop() {
    if (timer_) {
        esp_err_t err = esp_timer_stop(timer_);
        if (err != ESP_OK && err != ESP_ERR_INVALID_STATE) {
            ESP_LOGW(kTag, "slow reconnect stop failed err=%s", esp_err_to_name(err));
        }
    }
    slow_scan_pending_.store(false, std::memory_order_release);
}

bool WifiReconnectManager::ConsumeSlowScanPending() {
    return slow_scan_pending_.exchange(false, std::memory_order_acq_rel);
}

void WifiReconnectManager::OnTimer(void* arg) {
    auto* self = static_cast<WifiReconnectManager*>(arg);
    if (!self->owner_ || !self->owner_->ReconnectAllowed() || !self->owner_->StationModeActive())
        return;
    self->DoSlowScanReconnect();
}

void WifiReconnectManager::DoSlowScanReconnect() {
    if (!owner_)
        return;
    owner_->ResetFastFailCount();
    owner_->MarkSlowReconnectConnecting();
    slow_scan_pending_.store(true, std::memory_order_release);

    wifi_scan_config_t scan_cfg   = {};
    scan_cfg.ssid                 = nullptr;
    scan_cfg.bssid                = nullptr;
    scan_cfg.channel              = 0;
    scan_cfg.show_hidden          = true;
    scan_cfg.scan_type            = WIFI_SCAN_TYPE_ACTIVE;
    scan_cfg.scan_time.active.min = 0;
    scan_cfg.scan_time.active.max = 120;

    esp_err_t err = esp_wifi_scan_start(&scan_cfg, false);
    if (err != ESP_OK) {
        ESP_LOGW(kTag, "slow scan start failed err=%s action=reschedule", esp_err_to_name(err));
        slow_scan_pending_.store(false, std::memory_order_release);
        Schedule();
    }
}

void WifiReconnectManager::HandleSlowScanResult() {
    uint16_t ap_num = 0;
    esp_wifi_scan_get_ap_num(&ap_num);
    if (ap_num == 0) {
        Schedule();
        return;
    }
    ap_num = std::min<uint16_t>(ap_num, kMaxSlowScanRecords);
    std::array<wifi_ap_record_t, kMaxSlowScanRecords> records{};
    esp_wifi_scan_get_ap_records(&ap_num, records.data());
    std::sort(records.begin(), records.begin() + ap_num,
              [](const wifi_ap_record_t& a, const wifi_ap_record_t& b) { return a.rssi > b.rssi; });

    wifi_config_t wc = {};
    if (esp_wifi_get_config(WIFI_IF_STA, &wc) != ESP_OK) {
        ESP_LOGW(kTag, "slow scan config read failed");
        Schedule();
        return;
    }
    const std::string current_ssid(
        reinterpret_cast<const char*>(wc.sta.ssid), BoundedSsidLen(wc.sta.ssid));
    const wifi_ap_record_t* match = nullptr;
    cred::Credentials saved;
    cred::Load(saved);

    // We only enter this slow-scan path after repeated reconnect failures.
    // Prefer a different visible saved network first, even if the old AP is
    // still advertising. A visible AP can still be unusable because of
    // association/DHCP/upstream problems; repeatedly choosing it defeats
    // multi-profile failover.
    for (uint16_t i = 0; i < ap_num && !match; ++i) {
        for (std::size_t p = 0; p < saved.wifi_profile_count; ++p) {
            const auto& profile = saved.wifi_profiles[p];
            if (profile.ssid == current_ssid || !SsidEquals(records[i].ssid, profile.ssid))
                continue;
            if (!ApplySavedProfile(wc, profile))
                continue;
            match = &records[i];
            ESP_LOGI(kTag, "slow reconnect alternate profile_index=%u ssid=%s rssi=%d",
                     static_cast<unsigned>(p), profile.ssid.c_str(), static_cast<int>(records[i].rssi));
            break;
        }
    }

    // If no alternative saved network is visible, retry the current one.
    if (!match && !current_ssid.empty()) {
        for (uint16_t i = 0; i < ap_num; ++i) {
            if (SsidEquals(records[i].ssid, current_ssid)) {
                match = &records[i];
                ESP_LOGI(kTag, "slow reconnect retry current ssid=%s rssi=%d",
                         current_ssid.c_str(), static_cast<int>(records[i].rssi));
                break;
            }
        }
    }

    // The configured current SSID may no longer be present at all. If so,
    // choose the strongest visible saved profile (including slot 0).
    if (!match) {
        for (uint16_t i = 0; i < ap_num && !match; ++i) {
            for (std::size_t p = 0; p < saved.wifi_profile_count; ++p) {
                if (!SsidEquals(records[i].ssid, saved.wifi_profiles[p].ssid))
                    continue;
                if (!ApplySavedProfile(wc, saved.wifi_profiles[p]))
                    continue;
                match = &records[i];
                ESP_LOGI(kTag, "slow reconnect fallback profile_index=%u ssid=%s rssi=%d",
                         static_cast<unsigned>(p), saved.wifi_profiles[p].ssid.c_str(),
                         static_cast<int>(records[i].rssi));
                break;
            }
        }
    }

    if (!match) {
        Schedule();
        return;
    }

    wc.sta.bssid_set = 1;
    std::memcpy(wc.sta.bssid, match->bssid, 6);
    wc.sta.channel = match->primary;
    esp_err_t config_err = esp_wifi_set_config(WIFI_IF_STA, &wc);
    if (config_err != ESP_OK) {
        ESP_LOGW(kTag, "slow reconnect config failed err=%s", esp_err_to_name(config_err));
        Schedule();
        return;
    }

    esp_err_t err = esp_wifi_connect();
    if (err != ESP_OK) {
        ESP_LOGW(kTag, "slow reconnect failed err=%s", esp_err_to_name(err));
        Schedule();
    }
}
