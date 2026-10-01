#pragma once

#include <algorithm>
#include <cstdint>
#include <limits>

namespace wifi_retry_policy {

constexpr uint32_t kReconnectBudgetSec = 30;
constexpr int64_t kReconnectBudgetMs = static_cast<int64_t>(kReconnectBudgetSec) * 1000;
constexpr int64_t kReconnectBudgetUs = static_cast<int64_t>(kReconnectBudgetSec) * 1'000'000LL;
constexpr int kDefaultPerProfileTimeoutMs = 12000;

// Saturating signed 64-bit subtraction: a - b, clamped to [INT64_MIN, INT64_MAX].
constexpr int64_t SubSat(int64_t a, int64_t b) {
    if (b > 0 && a < std::numeric_limits<int64_t>::min() + b) {
        return std::numeric_limits<int64_t>::min();
    }
    if (b < 0 && a > std::numeric_limits<int64_t>::max() + b) {
        return std::numeric_limits<int64_t>::max();
    }
    return a - b;
}

constexpr int64_t RemainingMs(int64_t started_ms, int64_t now_ms, int64_t budget_ms = kReconnectBudgetMs) {
    return SubSat(budget_ms, SubSat(now_ms, started_ms));
}

constexpr int64_t RemainingUs(int64_t started_us, int64_t now_us, int64_t budget_us = kReconnectBudgetUs) {
    return SubSat(budget_us, SubSat(now_us, started_us));
}

constexpr bool IsRecoveryBudgetExpired(int64_t started_ms, int64_t now_ms, int64_t budget_ms = kReconnectBudgetMs) {
    return SubSat(now_ms, started_ms) >= budget_ms;
}

constexpr bool IsRetryWindowExpired(int64_t started_us, int64_t now_us, int64_t budget_us = kReconnectBudgetUs) {
    if (started_us <= 0) {
        return false;
    }
    return SubSat(now_us, started_us) >= budget_us;
}

constexpr uint32_t ClampSavedRecoveryDelaySec(uint32_t scheduled_delay_sec, int64_t remaining_ms) {
    if (remaining_ms <= 0) {
        return 0;
    }
    const uint64_t ceiling_sec = (static_cast<uint64_t>(remaining_ms) + 999ULL) / 1000ULL;
    return static_cast<uint32_t>(std::min<uint64_t>(scheduled_delay_sec, ceiling_sec));
}

constexpr int ClampProfileTimeoutMs(int64_t remaining_ms, int max_timeout_ms = kDefaultPerProfileTimeoutMs) {
    if (remaining_ms <= 0) {
        return 0;
    }
    return static_cast<int>(std::min<int64_t>(max_timeout_ms, remaining_ms));
}

constexpr uint64_t ClampAutoRetryDelayUs(uint64_t requested_us, int64_t remaining_us) {
    if (remaining_us <= 0) {
        return 0;
    }
    return std::min<uint64_t>(requested_us, static_cast<uint64_t>(remaining_us));
}

}  // namespace wifi_retry_policy
