#pragma once
#include <cstdint>
#include "network/wifi_retry_policy.h"

namespace offline_sleep_policy {
constexpr int64_t kTimeoutMs = 60'000;
// A lost Wi-Fi connection must not leave a battery-powered Slate asleep until
// someone presses a key. Retry in low-power RTC wake cycles, without staying on.
constexpr uint32_t kRetryWakeSec = 15 * 60;
constexpr bool Expired(int64_t disconnected_since_ms, int64_t now_ms) {
    return disconnected_since_ms >= 0 &&
           wifi_retry_policy::IsRecoveryBudgetExpired(disconnected_since_ms, now_ms, kTimeoutMs);
}
}  // namespace offline_sleep_policy
