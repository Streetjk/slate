#pragma once

#include <cJSON.h>

#include <string>

namespace xiaozhi {

enum class IncomingMessageKind {
    kNone,
    kTtsStart,
    kTtsStop,
    kTtsSentenceStart,
    kSttText,
    kLlmEmotion,
    kAlert,
    kAlertMissingMessage,
    kCalendarProposal,
    kCalendarCreated,
    kCalendarCancelled,
};

struct IncomingMessage {
    IncomingMessageKind kind = IncomingMessageKind::kNone;
    std::string         text;
    std::string         status;
    std::string         message;
    std::string         emotion;
    std::string         ticket;
    std::string         title;
    std::string         start;
    std::string         end;
    std::string         location;
    std::string         timezone;
    bool                all_day = false;
};

IncomingMessage ParseIncomingMessage(const cJSON* root);

}  // namespace xiaozhi
