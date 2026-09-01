#include "xiaozhi/config/slate_voice_config_client.h"

#include <esp_log.h>

#include <string>

#include "network/cred_store.h"
#include "sync/api_client.h"
#include "xiaozhi/config/settings.h"

namespace {
constexpr char kTag[] = "slate_voice_cfg";

std::string WebsocketUrlFromSlateServer(const std::string& server_url) {
    std::string url = server_url;
    if (url.rfind("https://", 0) == 0) {
        url.replace(0, 8, "wss://");
    } else if (url.rfind("http://", 0) == 0) {
        url.replace(0, 7, "ws://");
    } else {
        return {};
    }
    while (!url.empty() && url.back() == '/')
        url.pop_back();
    return url + "/api/v1/voice/websocket";
}
}  // namespace

namespace xiaozhi {

SlateVoiceConfigResult SlateVoiceConfigClient::Fetch() {
    SlateVoiceConfigResult result;
    if (cred::GetDeviceSecret().empty()) {
        result.error = "Slate device identity is unavailable";
        return result;
    }

    api::VoiceConfig config;
    if (!api::GetVoiceConfig(config)) {
        result.error = "Slate voice configuration request failed";
        return result;
    }

    result.websocket_url = WebsocketUrlFromSlateServer(cred::GetServerUrl());
    result.protocol_ver  = config.version;
    if (result.websocket_url.empty() || config.websocket_path != "/api/v1/voice/websocket" || config.version != 1) {
        result.error = "Slate voice configuration was invalid";
        return result;
    }

    settings::WebsocketConfig websocket;
    websocket.url     = result.websocket_url;
    websocket.version = config.version;
    // Do not copy the device secret into the voice-config namespace. The
    // WebSocket handshake obtains the current secret from slate.net NVS.
    websocket.token.clear();
    if (!settings::SaveWebsocket(websocket)) {
        result.error = "Slate voice configuration could not be saved";
        return result;
    }

    result.ok           = true;
    result.has_protocol = true;
    ESP_LOGI(kTag, "Slate voice configuration ready protocol=websocket version=%d", config.version);
    return result;
}

}  // namespace xiaozhi
