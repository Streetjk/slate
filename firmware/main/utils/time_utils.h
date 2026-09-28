#pragma once

#include <esp_timer.h>
#include <sdkconfig.h>

#include <algorithm>
#include <cstdint>
#include <cstdlib>
#include <ctime>

namespace time_utils {

inline int64_t NowMs() {
    return esp_timer_get_time() / 1000;
}

inline void EnsureTimezoneConfigured() {
    static const bool configured = [] {
        setenv("TZ", CONFIG_SLATE_DEFAULT_TIMEZONE, 1);
        tzset();
        return true;
    }();
    (void)configured;
}

inline bool WallClockValid(time_t now = time(nullptr)) {
    return now > static_cast<time_t>(1577836800);  // 2020-01-01 UTC
}

inline int QuietStartMinuteOfDay() {
    return CONFIG_SLATE_QUIET_START_HOUR * 60 + CONFIG_SLATE_QUIET_START_MINUTE;
}

inline int QuietEndMinuteOfDay() {
    return CONFIG_SLATE_QUIET_END_HOUR * 60 + CONFIG_SLATE_QUIET_END_MINUTE;
}

inline int MinuteOfDay(const tm& local) {
    return local.tm_hour * 60 + local.tm_min;
}

inline bool QuietHoursActiveAt(time_t now) {
    if (!WallClockValid(now))
        return false;
    EnsureTimezoneConfigured();
    tm local{};
    if (!localtime_r(&now, &local))
        return false;

    const int start = QuietStartMinuteOfDay();
    const int end   = QuietEndMinuteOfDay();
    if (start == end)
        return false;
    const int minute = MinuteOfDay(local);
    if (start < end)
        return minute >= start && minute < end;
    return minute >= start || minute < end;  // overnight window, e.g. 23:00-05:30
}

inline bool QuietHoursActive() {
    return QuietHoursActiveAt(time(nullptr));
}

inline time_t QuietEndEpochFor(time_t quiet_time) {
    if (!QuietHoursActiveAt(quiet_time))
        return 0;
    EnsureTimezoneConfigured();

    tm local{};
    if (!localtime_r(&quiet_time, &local))
        return 0;

    const int start  = QuietStartMinuteOfDay();
    const int end    = QuietEndMinuteOfDay();
    const int minute = MinuteOfDay(local);

    tm end_tm = local;
    end_tm.tm_hour = CONFIG_SLATE_QUIET_END_HOUR;
    end_tm.tm_min  = CONFIG_SLATE_QUIET_END_MINUTE;
    end_tm.tm_sec  = 0;

    // For an overnight window, a time on/after the start belongs to the quiet
    // period whose end is tomorrow morning. A time before the end belongs to
    // the quiet period that started yesterday.
    if (start > end && minute >= start)
        end_tm.tm_mday += 1;

    return mktime(&end_tm);
}

inline uint32_t SecondsUntilQuietEnd(time_t now = time(nullptr)) {
    const time_t end = QuietEndEpochFor(now);
    if (end <= now)
        return 0;
    const uint64_t delta = static_cast<uint64_t>(end - now);
    return static_cast<uint32_t>(std::min<uint64_t>(delta, UINT32_MAX));
}

// Preserve a requested timer wake unless it would occur inside the quiet
// window. If it would, defer that wake to the end of quiet hours instead.
inline uint32_t AdjustWakeForQuietHours(uint32_t requested_sec, time_t now = time(nullptr)) {
    if (requested_sec == 0 || !WallClockValid(now))
        return requested_sec;

    if (QuietHoursActiveAt(now)) {
        const uint32_t until_end = SecondsUntilQuietEnd(now);
        return until_end > 0 ? until_end : requested_sec;
    }

    const time_t target = now + static_cast<time_t>(requested_sec);
    if (!QuietHoursActiveAt(target))
        return requested_sec;

    const time_t quiet_end = QuietEndEpochFor(target);
    if (quiet_end <= now)
        return requested_sec;
    const uint64_t delta = static_cast<uint64_t>(quiet_end - now);
    return static_cast<uint32_t>(std::min<uint64_t>(delta, UINT32_MAX));
}

}  // namespace time_utils
