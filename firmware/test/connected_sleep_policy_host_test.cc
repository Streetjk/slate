#include <cassert>
#include <cstdint>
#include <limits>
#include "power/connected_sleep_policy.h"
int main() {
    using connected_sleep_policy::NextWakeSec;
    assert(NextWakeSec(0) == 600);   // Static pages continue remote sync.
    assert(NextWakeSec(60) == 60);   // Short server TTL stays intact.
    assert(NextWakeSec(300) == 300); // AI usage schedule.
    assert(NextWakeSec(600) == 600);
    assert(NextWakeSec(900) == 900); // News schedule.
    assert(NextWakeSec(3600) == 3600); // Failure backoff must not be shortened.
    assert(NextWakeSec(std::numeric_limits<uint32_t>::max()) ==
           std::numeric_limits<uint32_t>::max());
}
