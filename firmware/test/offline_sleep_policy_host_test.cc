#include "power/offline_sleep_policy.h"
#include <cassert>
#include <limits>
int main() {
    using offline_sleep_policy::Expired;
    // The reconnect timer must outlive the 60-second failure budget and
    // eventually recover a static cached frame without a button press.
    static_assert(offline_sleep_policy::kRetryWakeSec == 900);
    static_assert(offline_sleep_policy::kTimeoutMs == 60'000);
    assert(!Expired(-1, 60000));
    assert(!Expired(0, 59999));
    assert(Expired(0, 60000));
    assert(Expired(0, 60001));
    assert(!Expired(1000, 60999));
    assert(Expired(1000, 61000));
    assert(!Expired(1000, 999));  // backward clock
    assert(Expired(0, std::numeric_limits<int64_t>::max()));
    assert(!Expired(std::numeric_limits<int64_t>::max(), 0));
    // Reconnect clears the sentinel; the next loss gets a fresh start.
    assert(!Expired(-1, 100000));
    assert(!Expired(100000, 159999));
    assert(Expired(100000, 160000));
}
