#pragma once
#include <cstdint>
namespace connected_sleep_policy {
// Preserve dynamic scheduling/backoff; static pages still discover remote edits.
constexpr uint32_t NextWakeSec(uint32_t frame_wake_sec) {
    return frame_wake_sec > 0 ? frame_wake_sec : 600u;
}
}  // namespace connected_sleep_policy
