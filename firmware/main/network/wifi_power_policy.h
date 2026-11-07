#pragma once

#include <cstdint>

// Serialized by Wifi's power mutex. MIN_MODEM at idle follows the AP DTIM;
// it does not reinstate the aggressive MAX_MODEM/listen_interval=10 profile.
class WifiPowerPolicy {
   public:
    void Acquire() { ++active_users_; }
    bool Release() {
        if (active_users_ == 0)
            return false;
        --active_users_;
        return true;
    }
    bool KeepAwake() const { return active_users_ != 0; }

   private:
    uint32_t active_users_ = 0;
};

// The same scope is used by production and the host regression harness.
template <typename Owner>
class ScopedWifiNetworkActivity {
   public:
    ScopedWifiNetworkActivity() : ScopedWifiNetworkActivity(Owner::Get()) {}
    explicit ScopedWifiNetworkActivity(Owner& owner) : owner_(owner) {
        owner_.AcquireNetworkActivity();
    }
    ~ScopedWifiNetworkActivity() { owner_.ReleaseNetworkActivity(); }
    ScopedWifiNetworkActivity(const ScopedWifiNetworkActivity&) = delete;
    ScopedWifiNetworkActivity& operator=(const ScopedWifiNetworkActivity&) = delete;

   private:
    Owner& owner_;
};
