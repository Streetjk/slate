#include "network/wifi_power_policy.h"
#include <cassert>
#include <mutex>
#include <type_traits>

struct FakeRadio {
    std::mutex mutex;
    WifiPowerPolicy policy;
    bool awake = false;
    void ApplyLocked() { awake = policy.KeepAwake(); }
    void AcquireNetworkActivity() {
        std::lock_guard<std::mutex> lock(mutex);
        policy.Acquire();
        ApplyLocked();
    }
    void ReleaseNetworkActivity() {
        std::lock_guard<std::mutex> lock(mutex);
        assert(policy.Release());
        ApplyLocked();
    }
    void OnGotIp() {
        std::lock_guard<std::mutex> lock(mutex);
        ApplyLocked();
    }
};
using Activity = ScopedWifiNetworkActivity<FakeRadio>;
static_assert(!std::is_copy_constructible_v<Activity>);
static_assert(!std::is_move_constructible_v<Activity>);
void EarlyReturn(FakeRadio& radio) {
    const Activity activity(radio);
    assert(radio.awake);
    return;  // network error/cancellation must release the production RAII scope
}

int main() {
    FakeRadio radio;
    radio.OnGotIp();
    assert(!radio.awake);
    EarlyReturn(radio);
    assert(!radio.awake);
    {
        const Activity sync(radio);
        radio.OnGotIp();
        assert(radio.awake); // reconnect cannot override an active owner
        {
            const Activity voice(radio);
            EarlyReturn(radio);
            assert(radio.awake);
        }
        assert(radio.awake); // voice end cannot sleep an active sync
    }
    assert(!radio.awake);
    radio.OnGotIp();
    assert(!radio.awake); // idle reconnect must retain modem sleep

    WifiPowerPolicy policy;
    assert(!policy.KeepAwake());       // normal idle must allow modem sleep
    assert(!policy.Release());         // invalid release must not wrap unsigned
    assert(!policy.KeepAwake());
    policy.Acquire();                  // initial network setup
    assert(policy.KeepAwake());
    policy.Acquire();                  // sync overlaps setup completion
    assert(policy.Release());
    assert(policy.KeepAwake());        // setup cannot put active sync to sleep
    policy.Acquire();                  // voice overlaps sync
    assert(policy.Release());
    assert(policy.KeepAwake());        // sync cannot put active voice to sleep
    assert(policy.Release());
    assert(!policy.KeepAwake());       // last owner restores idle

    // Repeated successful/failed/cancelled work has the same ownership lifetime.
    for (int i = 0; i < 10000; ++i) {
        policy.Acquire();
        assert(policy.KeepAwake());
        assert(policy.Release());
        assert(!policy.KeepAwake());
    }
    assert(!policy.Release());
    assert(!policy.KeepAwake());
}
