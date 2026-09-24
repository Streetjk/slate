#include "power/shutdown.h"

#include <esp_log.h>
#include <esp_system.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>

#include "bsp/board.h"
#include "bsp/charge_status.h"
#include "drivers/audio/audio_player.h"
#include "drivers/display/epd_ssd1683.h"
#include "sync/sync_service.h"

namespace power_shutdown {

namespace {
constexpr char kTag[] = "shutdown";
PreShutdownHook s_pre_shutdown_hook = nullptr;
}

void SetPreShutdownHook(PreShutdownHook hook) {
    s_pre_shutdown_hook = hook;
}

bool WaitForEpdAndShutdown(int epd_timeout_ms) {
    if (s_pre_shutdown_hook)
        s_pre_shutdown_hook();
    SyncService::Get().Stop();
    AudioPlayer::Get().Stop();
    if (auto* charge = Board::Get().charge())
        charge->StopTick();

    auto* epd = Board::Get().epd();
    if (!epd)
        return true;

    // A local-navigation burst may leave the SSD2683 internally powered for a
    // few seconds. Route power-down through the refresh task before cutting the
    // external rail so shutdown/deep sleep preserves the proven 0x02 sequence.
    epd->SetInteractivePrewarmEnabled(false);
    epd->RequestInteractivePowerDown();
    return epd->WaitForRefreshIdle(epd_timeout_ms);
}

[[noreturn]] void GracefulRestart(int pre_delay_ms, int epd_timeout_ms) {
    if (pre_delay_ms > 0)
        vTaskDelay(pdMS_TO_TICKS(pre_delay_ms));

    while (!WaitForEpdAndShutdown(epd_timeout_ms)) {
        ESP_LOGE(kTag, "restart deferred reason=epd_drain_timeout retry_ms=1000");
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    esp_restart();
    __builtin_unreachable();
}

}  // namespace power_shutdown
