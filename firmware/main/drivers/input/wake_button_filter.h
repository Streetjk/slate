#pragma once

// Hide the wake gesture from the recognizer until a debounced release.
// Subsequent presses use the normal click/long/double rules.
class WakeButtonFilter {
 public:
    explicit WakeButtonFilter(bool consume_wake, unsigned release_samples = 2)
        : waiting_for_release_(consume_wake), release_samples_(release_samples ? release_samples : 1) {}
    bool Read(bool pressed) {
        if (!waiting_for_release_) return pressed;
        if (pressed) released_samples_ = 0;
        else if (++released_samples_ >= release_samples_) waiting_for_release_ = false;
        return false;
    }
 private:
    bool waiting_for_release_;
    unsigned release_samples_;
    unsigned released_samples_ = 0;
};
