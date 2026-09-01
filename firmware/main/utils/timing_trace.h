#pragma once

#include <esp_log.h>
#include <esp_timer.h>

// Timing traces are enabled only for the explicitly requested diagnostic build
// (`-DSLATE_EPD_TIMING=1`). The normal firmware has no extra timing logging.
#if defined(SLATE_EPD_TIMING)
#define SLATE_TIMING_LOG(tag, fmt, ...) \
    ESP_LOGI(tag, "timing t_us=%lld " fmt, static_cast<long long>(esp_timer_get_time()), ##__VA_ARGS__)
#else
#define SLATE_TIMING_LOG(tag, fmt, ...) ((void)0)
#endif
