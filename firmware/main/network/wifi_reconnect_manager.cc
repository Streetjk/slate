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
    wifi_config_t wc = {};
    if (esp_wifi_get_config(WIFI_IF_STA, &wc) != ESP_OK) {
        ESP_LOGW(kTag, "slow scan config read failed");
        Schedule();
        return;
    }

    const std::string current_ssid(
        reinterpret_cast<const char*>(wc.sta.ssid), BoundedSsidLen(wc.sta.ssid));
    cred::Credentials saved;
    cred::Load(saved);

    uint16_t ap_num = 0;
    esp_wifi_scan_get_ap_num(&ap_num);
    ap_num = std::min<uint16_t>(ap_num, kMaxSlowScanRecords);
    std::array<wifi_ap_record_t, kMaxSlowScanRecords> records{};
    if (ap_num > 0 && esp_wifi_scan_get_ap_records(&ap_num, records.data()) == ESP_OK) {
        std::sort(records.begin(), records.begin() + ap_num,
                  [](const wifi_ap_record_t& a, const wifi_ap_record_t& b) { return a.rssi > b.rssi; });
    } else {
        ap_num = 0;
    }

    const wifi_ap_record_t* match = nullptr;
    bool direct_profile_attempt = false;

    // First choice: a different saved network that the scan can see. This is
    // normally the fastest work<->home handoff and lets us pin the BSSID/channel.
    for (uint16_t i = 0; i < ap_num && !match; ++i) {
        for (std::size_t p = 0; p < saved.wifi_profile_count; ++p) {
            const auto& profile = saved.wifi_profiles[p];
            if (profile.ssid == current_ssid || !SsidEquals(records[i].ssid, profile.ssid))
                continue;
            if (!ApplySavedProfile(wc, profile))
                continue;
            match = &records[i];
            ESP_LOGI(kTag, "slow reconnect visible alternate profile_index=%u rssi=%d",
                     static_cast<unsigned>(p), static_cast<int>(records[i].rssi));
            break;
        }
    }

    // A scan can miss an AP in a dense environment, and hidden SSIDs cannot be
    // matched reliably at all. After repeated failures of the current profile,
    // directly try another saved profile unpinned before falling back to the
    // same network. This guarantees multi-profile failover does not depend on a
    // successful scan result.
    if (!match) {
        for (std::size_t p = 0; p < saved.wifi_profile_count; ++p) {
            const auto& profile = saved.wifi_profiles[p];
            if (profile.ssid.empty() || profile.ssid == current_ssid)
                continue;
            if (!ApplySavedProfile(wc, profile))
                continue;
            direct_profile_attempt = true;
            ESP_LOGI(kTag, "slow reconnect direct alternate profile_index=%u",
                     static_cast<unsigned>(p));
            break;
        }
    }

    // Only one usable saved profile remains: retry the current profile without
    // a stale BSSID/channel pin. If the scan saw it, pin to the strongest AP.
    if (!match && !direct_profile_attempt && !current_ssid.empty()) {
        for (uint16_t i = 0; i < ap_num; ++i) {
            if (SsidEquals(records[i].ssid, current_ssid)) {
                match = &records[i];
                ESP_LOGI(kTag, "slow reconnect retry current rssi=%d", static_cast<int>(records[i].rssi));
                break;
            }
        }
        if (!match) {
            wc.sta.bssid_set = 0;
            wc.sta.channel = 0;
            direct_profile_attempt = true;
            ESP_LOGI(kTag, "slow reconnect retry current unpinned");
        }
    }

    if (!match && !direct_profile_attempt) {
        Schedule();
        return;
    }

    if (match) {
        wc.sta.bssid_set = 1;
        std::memcpy(wc.sta.bssid, match->bssid, 6);
        wc.sta.channel = match->primary;
    } else {
        wc.sta.bssid_set = 0;
        wc.sta.channel = 0;
    }

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
