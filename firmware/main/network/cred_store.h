#pragma once

// NVS credential storage.
//
// Wi-Fi is stored as up to four profiles. Slot 0 is the preferred / last
// successful network. The legacy ssid/pwd keys remain mirrored to slot 0 so
// existing devices upgrade without losing their configured network.

#include <array>
#include <cstddef>
#include <string>

namespace cred {

inline constexpr std::size_t kMaxWifiProfiles = 4;

struct WifiProfile {
    std::string ssid;
    std::string password;
};

struct Credentials {
    std::array<WifiProfile, kMaxWifiProfiles> wifi_profiles{};
    std::size_t wifi_profile_count = 0;
    std::string wifi_ssid;
    std::string wifi_pwd;
    std::string server_url;
    std::string device_id;
    std::string device_secret;
};

// Load all persisted fields. Existing single-network ssid/pwd data is exposed
// as profile 0 when no multi-network slots have been written yet.
bool Load(Credentials& out);

// Add/update c.wifi_ssid and move it to profile 0 while preserving the other
// saved networks. Also updates server_url. Device identity is untouched.
bool Save(const Credentials& c);

// Promote a successfully connected profile to slot 0 and persist the order.
// Returns false when ssid is not one of the saved profiles or persistence fails.
bool PromoteWifiProfile(Credentials& c, const std::string& ssid);

// Persist the backend-issued device identity independently from Wi-Fi profiles.
bool SaveSecret(const std::string& device_id, const std::string& device_secret);

// Clear device identity while preserving Wi-Fi profiles and server URL.
void ClearSecret();

std::string GetServerUrl();
std::string GetDeviceSecret();

// Factory reset: clear the complete network/device namespace.
void Clear();

}  // namespace cred
