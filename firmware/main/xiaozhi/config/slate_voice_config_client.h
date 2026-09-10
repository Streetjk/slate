#pragma once

#include <string>

namespace xiaozhi {

struct SlateVoiceConfigResult {
    bool        ok            = false;
    bool        has_protocol  = false;
    int         http_status   = 0;
    int         protocol_ver  = 0;
    std::string websocket_url;
    std::string error;
};

// Fetches the narrow voice route from the authenticated Slate device API.
// The device secret is never returned by this endpoint or persisted in the
// voice configuration; WebsocketProtocol reads the current secret from NVS.
class SlateVoiceConfigClient {
   public:
    SlateVoiceConfigResult Fetch();
};

}  // namespace xiaozhi
