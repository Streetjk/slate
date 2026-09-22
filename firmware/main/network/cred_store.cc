#include "network/cred_store.h"

#include <esp_log.h>

#include <array>
#include <utility>

#include "storage/nvs/nvs_schema.h"
#include "storage/nvs/nvs_store.h"

namespace {
constexpr char kTag[] = "cred";

constexpr std::array<const char*, cred::kMaxWifiProfiles> kSsidKeys = {
    nvs_schema::net::kSsid0,
    nvs_schema::net::kSsid1,
    nvs_schema::net::kSsid2,
    nvs_schema::net::kSsid3,
};
constexpr std::array<const char*, cred::kMaxWifiProfiles> kPwdKeys = {
    nvs_schema::net::kPwd0,
    nvs_schema::net::kPwd1,
    nvs_schema::net::kPwd2,
    nvs_schema::net::kPwd3,
};

void SetPreferredFields(cred::Credentials& c) {
    if (c.wifi_profile_count == 0) {
        c.wifi_ssid.clear();
        c.wifi_pwd.clear();
        return;
    }
    c.wifi_ssid = c.wifi_profiles[0].ssid;
    c.wifi_pwd  = c.wifi_profiles[0].password;
}

void AddLoadedProfile(cred::Credentials& c, const std::string& ssid, const std::string& password) {
    if (ssid.empty() || c.wifi_profile_count >= cred::kMaxWifiProfiles)
        return;
    for (std::size_t i = 0; i < c.wifi_profile_count; ++i) {
        if (c.wifi_profiles[i].ssid == ssid)
            return;
    }
    c.wifi_profiles[c.wifi_profile_count++] = {ssid, password};
}

void UpsertProfileFront(cred::Credentials& c, const std::string& ssid, const std::string& password) {
    std::array<cred::WifiProfile, cred::kMaxWifiProfiles> next{};
    std::size_t next_count = 0;
    next[next_count++]     = {ssid, password};

    for (std::size_t i = 0; i < c.wifi_profile_count && next_count < cred::kMaxWifiProfiles; ++i) {
        if (c.wifi_profiles[i].ssid.empty() || c.wifi_profiles[i].ssid == ssid)
            continue;
        next[next_count++] = c.wifi_profiles[i];
    }

    c.wifi_profiles      = std::move(next);
    c.wifi_profile_count = next_count;
    SetPreferredFields(c);
}

bool PersistNetwork(const cred::Credentials& c) {
    const std::string empty;
    auto profile_ssid = [&](std::size_t i) -> const std::string& {
        return i < c.wifi_profile_count ? c.wifi_profiles[i].ssid : empty;
    };
    auto profile_pwd = [&](std::size_t i) -> const std::string& {
        return i < c.wifi_profile_count ? c.wifi_profiles[i].password : empty;
    };

    const std::string preferred_ssid = c.wifi_profile_count ? c.wifi_profiles[0].ssid : std::string{};
    const std::string preferred_pwd  = c.wifi_profile_count ? c.wifi_profiles[0].password : std::string{};

    return nvs_store::SetStrings(
        nvs_schema::kNet,
        {
            {nvs_schema::net::kSsid, preferred_ssid},
            {nvs_schema::net::kPwd, preferred_pwd},
            {kSsidKeys[0], profile_ssid(0)},
            {kPwdKeys[0], profile_pwd(0)},
            {kSsidKeys[1], profile_ssid(1)},
            {kPwdKeys[1], profile_pwd(1)},
            {kSsidKeys[2], profile_ssid(2)},
            {kPwdKeys[2], profile_pwd(2)},
            {kSsidKeys[3], profile_ssid(3)},
            {kPwdKeys[3], profile_pwd(3)},
            {nvs_schema::net::kUrl, c.server_url},
        });
}
}  // namespace

namespace cred {

bool Load(Credentials& out) {
    out = Credentials{};

    std::string legacy_ssid;
    std::string legacy_pwd;
    nvs_store::GetStrings(nvs_schema::kNet,
                          {
                              {nvs_schema::net::kSsid, &legacy_ssid},
                              {nvs_schema::net::kPwd, &legacy_pwd},
                              {nvs_schema::net::kUrl, &out.server_url},
                              {nvs_schema::net::kDevId, &out.device_id},
                              {nvs_schema::net::kDevSec, &out.device_secret},
                          });

    for (std::size_t i = 0; i < kMaxWifiProfiles; ++i) {
        const std::string ssid = nvs_store::GetString(nvs_schema::kNet, kSsidKeys[i]);
        if (ssid.empty())
            continue;
        AddLoadedProfile(out, ssid, nvs_store::GetString(nvs_schema::kNet, kPwdKeys[i]));
    }

    // Upgrade compatibility: old firmware stored only ssid/pwd.
    if (out.wifi_profile_count == 0 && !legacy_ssid.empty())
        AddLoadedProfile(out, legacy_ssid, legacy_pwd);

    SetPreferredFields(out);
    return !out.wifi_ssid.empty() && !out.server_url.empty();
}

bool Save(const Credentials& c) {
    if (c.wifi_ssid.empty() || c.server_url.empty()) {
        ESP_LOGW(kTag, "save failed type=credentials reason=missing_wifi_or_url");
        return false;
    }

    Credentials merged;
    Load(merged);
    merged.server_url = c.server_url;
    UpsertProfileFront(merged, c.wifi_ssid, c.wifi_pwd);

    const bool ok = PersistNetwork(merged);
    if (!ok) {
        ESP_LOGE(kTag, "save failed type=credentials");
        return false;
    }
    ESP_LOGI(kTag, "wifi profile saved count=%u", static_cast<unsigned>(merged.wifi_profile_count));
    return true;
}

bool PromoteWifiProfile(Credentials& c, const std::string& ssid) {
    for (std::size_t i = 0; i < c.wifi_profile_count; ++i) {
        if (c.wifi_profiles[i].ssid != ssid)
            continue;
        const std::string password = c.wifi_profiles[i].password;
        UpsertProfileFront(c, ssid, password);
        if (!PersistNetwork(c)) {
            ESP_LOGW(kTag, "wifi profile promote failed");
            return false;
        }
        return true;
    }
    return false;
}

bool SaveSecret(const std::string& device_id, const std::string& device_secret) {
    const bool ok = nvs_store::SetStrings(nvs_schema::kNet,
                                          {
                                              {nvs_schema::net::kDevId, device_id},
                                              {nvs_schema::net::kDevSec, device_secret},
                                          });
    if (!ok) {
        ESP_LOGE(kTag, "save failed type=secret");
        return false;
    }
    return true;
}

void ClearSecret() {
    nvs_store::EraseKey(nvs_schema::kNet, nvs_schema::net::kDevId);
    nvs_store::EraseKey(nvs_schema::kNet, nvs_schema::net::kDevSec);
    ESP_LOGW(kTag, "secret cleared action=reregister_next_boot");
}

std::string GetServerUrl() {
    return nvs_store::GetString(nvs_schema::kNet, nvs_schema::net::kUrl);
}

std::string GetDeviceSecret() {
    return nvs_store::GetString(nvs_schema::kNet, nvs_schema::net::kDevSec);
}

void Clear() {
    nvs_store::EraseNamespace(nvs_schema::kNet);
    nvs_store::EraseNamespace(nvs_schema::kLegacy);
}

}  // namespace cred
