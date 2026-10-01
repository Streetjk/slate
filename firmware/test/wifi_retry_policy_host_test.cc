#include "network/wifi_retry_policy.h"

#include <cassert>
#include <cstdint>
#include <limits>

// Honest pure-function coverage note:
// This deterministic host test exercises the pure constexpr retry policy functions,
// clamp calculations, overflow saturation, and time boundary behaviors.
// It does NOT execute FreeRTOS tasks, esp_timer hardware, atomic state transitions,
// or the runtime saved-recovery network loop.

namespace {

void TestProductionConstants() {
    static_assert(wifi_retry_policy::kReconnectBudgetSec == 30);
    static_assert(wifi_retry_policy::kReconnectBudgetMs == 30000);
    static_assert(wifi_retry_policy::kReconnectBudgetUs == 30000000);
    static_assert(wifi_retry_policy::kDefaultPerProfileTimeoutMs == 12000);

    assert(wifi_retry_policy::kReconnectBudgetSec == 30);
    assert(wifi_retry_policy::kReconnectBudgetMs == 30000);
    assert(wifi_retry_policy::kReconnectBudgetUs == 30000000);
    assert(wifi_retry_policy::kDefaultPerProfileTimeoutMs == 12000);
}

void TestPositiveStartBoundaries() {
    constexpr int64_t kStartMs = 50000LL;
    constexpr int64_t kBudgetMs = 30000LL;

    // t = 0
    assert(wifi_retry_policy::RemainingMs(kStartMs, kStartMs, kBudgetMs) == 30000);
    assert(!wifi_retry_policy::IsRecoveryBudgetExpired(kStartMs, kStartMs, kBudgetMs));

    // t = budget - 1
    assert(wifi_retry_policy::RemainingMs(kStartMs, kStartMs + 29999LL, kBudgetMs) == 1);
    assert(!wifi_retry_policy::IsRecoveryBudgetExpired(kStartMs, kStartMs + 29999LL, kBudgetMs));

    // t = budget
    assert(wifi_retry_policy::RemainingMs(kStartMs, kStartMs + 30000LL, kBudgetMs) == 0);
    assert(wifi_retry_policy::IsRecoveryBudgetExpired(kStartMs, kStartMs + 30000LL, kBudgetMs));

    // t = budget + 1
    assert(wifi_retry_policy::RemainingMs(kStartMs, kStartMs + 30001LL, kBudgetMs) == -1);
    assert(wifi_retry_policy::RemainingMs(kStartMs, kStartMs + 30001LL, kBudgetMs) <= 0);
    assert(wifi_retry_policy::IsRecoveryBudgetExpired(kStartMs, kStartMs + 30001LL, kBudgetMs));

    // Microsecond positive start boundaries
    constexpr int64_t kStartUs = 100000000LL;
    constexpr int64_t kBudgetUs = 30000000LL;

    // t = 0
    assert(wifi_retry_policy::RemainingUs(kStartUs, kStartUs, kBudgetUs) == 30000000LL);
    assert(!wifi_retry_policy::IsRetryWindowExpired(kStartUs, kStartUs, kBudgetUs));

    // t = budget - 1 us
    assert(wifi_retry_policy::RemainingUs(kStartUs, kStartUs + 29999999LL, kBudgetUs) == 1LL);
    assert(!wifi_retry_policy::IsRetryWindowExpired(kStartUs, kStartUs + 29999999LL, kBudgetUs));

    // t = budget
    assert(wifi_retry_policy::RemainingUs(kStartUs, kStartUs + 30000000LL, kBudgetUs) == 0LL);
    assert(wifi_retry_policy::IsRetryWindowExpired(kStartUs, kStartUs + 30000000LL, kBudgetUs));

    // t = budget + 1 us
    assert(wifi_retry_policy::RemainingUs(kStartUs, kStartUs + 30000001LL, kBudgetUs) == -1LL);
    assert(wifi_retry_policy::RemainingUs(kStartUs, kStartUs + 30000001LL, kBudgetUs) <= 0);
    assert(wifi_retry_policy::IsRetryWindowExpired(kStartUs, kStartUs + 30000001LL, kBudgetUs));
}

void TestZeroStartAsymmetry() {
    // Review requirement 4: Zero-start behavior is intentional and asymmetric
    assert(wifi_retry_policy::RemainingMs(0, 0, 30000) == 30000);
    assert(wifi_retry_policy::RemainingMs(0, 29999, 30000) == 1);
    assert(wifi_retry_policy::RemainingMs(0, 30000, 30000) == 0);
    assert(wifi_retry_policy::RemainingMs(0, 30001, 30000) <= 0);
    assert(wifi_retry_policy::IsRecoveryBudgetExpired(0, 30000, 30000) == true);
    assert(wifi_retry_policy::RemainingUs(0, 30000000, 30000000) == 0);
    assert(wifi_retry_policy::IsRetryWindowExpired(0, 30000000, 30000000) == false);

    // Microsecond automatic scheduler zero-start behavior
    assert(wifi_retry_policy::RemainingUs(0, 0, 30000000) == 30000000);
    assert(wifi_retry_policy::RemainingUs(0, 29999999, 30000000) == 1);
    assert(wifi_retry_policy::RemainingUs(0, 30000001, 30000000) <= 0);
    // IsRetryWindowExpired retains the started_us <= 0 unstarted sentinel
    assert(wifi_retry_policy::IsRetryWindowExpired(0, 0, 30000000) == false);
    assert(wifi_retry_policy::IsRetryWindowExpired(0, 29999999, 30000000) == false);
    assert(wifi_retry_policy::IsRetryWindowExpired(0, 30000001, 30000000) == false);
    assert(wifi_retry_policy::IsRetryWindowExpired(-1, 30000000, 30000000) == false);
}

void TestBackwardClockObservation() {
    // Review requirement 5: backward clock preserves increased remainder
    assert(wifi_retry_policy::RemainingMs(100000, 99950, 30000) == 30050);
    assert(wifi_retry_policy::RemainingUs(100000000, 99950000, 30000000) == 30050000);

    // Clamp consequences with backward clock remainder
    assert(wifi_retry_policy::ClampProfileTimeoutMs(30050) == 12000);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 30050) == 15);
    // When scheduled delay is 60s, it is capped by the 31s ceiling of 30050 ms
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(60, 30050) == 31);

    // Microsecond automatic retry delay clamped to increased remaining
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(2000000ULL, 30050000LL) == 2000000ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(40000000ULL, 30050000LL) == 30050000ULL);
}

void TestFreshRecoveryBudget() {
    // A later newly started positive recovery receives a fresh full budget independent of the earlier window
    constexpr int64_t kFirstStartMs = 10000LL;
    constexpr int64_t kFirstEndMs = 45000LL;  // 35s elapsed, exhausted
    assert(wifi_retry_policy::RemainingMs(kFirstStartMs, kFirstEndMs) <= 0);
    assert(wifi_retry_policy::IsRecoveryBudgetExpired(kFirstStartMs, kFirstEndMs));

    constexpr int64_t kSecondStartMs = 50000LL;
    assert(wifi_retry_policy::RemainingMs(kSecondStartMs, kSecondStartMs) == 30000);
    assert(!wifi_retry_policy::IsRecoveryBudgetExpired(kSecondStartMs, kSecondStartMs));
    assert(wifi_retry_policy::RemainingMs(kSecondStartMs, kSecondStartMs + 15000LL) == 15000);
    assert(!wifi_retry_policy::IsRecoveryBudgetExpired(kSecondStartMs, kSecondStartMs + 15000LL));

    // Same for microsecond automatic reconnect
    constexpr int64_t kFirstStartUs = 10000000LL;
    constexpr int64_t kFirstEndUs = 45000000LL;
    assert(wifi_retry_policy::RemainingUs(kFirstStartUs, kFirstEndUs) <= 0);
    assert(wifi_retry_policy::IsRetryWindowExpired(kFirstStartUs, kFirstEndUs));

    constexpr int64_t kSecondStartUs = 50000000LL;
    assert(wifi_retry_policy::RemainingUs(kSecondStartUs, kSecondStartUs) == 30000000LL);
    assert(!wifi_retry_policy::IsRetryWindowExpired(kSecondStartUs, kSecondStartUs));
    assert(wifi_retry_policy::RemainingUs(kSecondStartUs, kSecondStartUs + 15000000LL) == 15000000LL);
    assert(!wifi_retry_policy::IsRetryWindowExpired(kSecondStartUs, kSecondStartUs + 15000000LL));
}

void TestSavedRecoveryDelayClamp() {
    static_assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, INT64_MAX) == 15);
    static_assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(UINT32_MAX, INT64_MAX) == UINT32_MAX);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, INT64_MAX) == 15);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(UINT32_MAX, INT64_MAX) == UINT32_MAX);

    // Ceiling-to-seconds behavior and budget cap
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 30000) == 15);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 14001) == 15);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 14000) == 14);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 9001) == 10);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 9000) == 9);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 1) == 1);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, 0) == 0);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, -500) == 0);
    // Capped by true remaining budget when scheduled exceeds ceiling
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(60, 25000) == 25);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(120, 5500) == 6);
}

void TestPerProfileTimeoutClamp() {
    // min(12000 ms, remaining)
    assert(wifi_retry_policy::ClampProfileTimeoutMs(30000) == 12000);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(15000) == 12000);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(12001) == 12000);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(12000) == 12000);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(11999) == 11999);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(5000) == 5000);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(1) == 1);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(0) == 0);
    assert(wifi_retry_policy::ClampProfileTimeoutMs(-100) == 0);
}

void TestAutoRetryDelayClamp() {
    // min(requested backoff, remaining)
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(2000000ULL, 30000000LL) == 2000000ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(5000000ULL, 30000000LL) == 5000000ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(5000000ULL, 4500000LL) == 4500000ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(2000000ULL, 1LL) == 1ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(2000000ULL, 0LL) == 0ULL);
    assert(wifi_retry_policy::ClampAutoRetryDelayUs(2000000ULL, -500LL) == 0ULL);
}

void TestOverflowAndSaturation() {
    constexpr int64_t kMin = std::numeric_limits<int64_t>::min();
    constexpr int64_t kMax = std::numeric_limits<int64_t>::max();

    // SubSat saturation
    assert(wifi_retry_policy::SubSat(kMax, -10) == kMax);
    assert(wifi_retry_policy::SubSat(kMin, 10) == kMin);
    assert(wifi_retry_policy::SubSat(kMax, kMin) == kMax);
    assert(wifi_retry_policy::SubSat(kMin, kMax) == kMin);

    // RemainingMs with extreme backward step saturates at INT64_MAX
    assert(wifi_retry_policy::RemainingMs(100, kMin, 30000) == kMax);
    assert(wifi_retry_policy::RemainingUs(100, kMin, 30000000) == kMax);

    // Saturated positive remainder returned by RemainingMs exercised with clamp
    constexpr int64_t kConstexprSaturatedRemainingMs = wifi_retry_policy::RemainingMs(100, kMin, 30000);
    static_assert(kConstexprSaturatedRemainingMs == INT64_MAX);
    static_assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, kConstexprSaturatedRemainingMs) == 15);
    static_assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(UINT32_MAX, kConstexprSaturatedRemainingMs) == UINT32_MAX);

    const int64_t saturated_remaining_ms = wifi_retry_policy::RemainingMs(100, kMin, 30000);
    assert(saturated_remaining_ms == INT64_MAX);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(15, saturated_remaining_ms) == 15);
    assert(wifi_retry_policy::ClampSavedRecoveryDelaySec(UINT32_MAX, saturated_remaining_ms) == UINT32_MAX);

    // Huge elapsed time
    assert(wifi_retry_policy::RemainingMs(kMin, kMax, 30000) <= 0);
    assert(wifi_retry_policy::IsRecoveryBudgetExpired(kMin, kMax, 30000) == true);
    assert(wifi_retry_policy::RemainingUs(kMin, kMax, 30000000) <= 0);
    assert(wifi_retry_policy::IsRetryWindowExpired(1, kMax, 30000000) == true);

    // Sentinel with extreme now
    assert(wifi_retry_policy::IsRetryWindowExpired(0, kMax, 30000000) == false);
    assert(wifi_retry_policy::IsRetryWindowExpired(kMin, kMax, 30000000) == false);
    assert(wifi_retry_policy::IsRetryWindowExpired(-1, kMax, 30000000) == false);
}

}  // namespace

int main() {
    TestProductionConstants();
    TestPositiveStartBoundaries();
    TestZeroStartAsymmetry();
    TestBackwardClockObservation();
    TestFreshRecoveryBudget();
    TestSavedRecoveryDelayClamp();
    TestPerProfileTimeoutClamp();
    TestAutoRetryDelayClamp();
    TestOverflowAndSaturation();
    return 0;
}
