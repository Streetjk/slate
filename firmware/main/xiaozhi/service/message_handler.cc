#include "xiaozhi/service/message_handler.h"

#include <cstring>

#include "utils/json_utils.h"

namespace xiaozhi {

IncomingMessage ParseIncomingMessage(const cJSON* root) {
    IncomingMessage message;
    cJSON*          type = cJSON_GetObjectItem(root, "type");
    if (!cJSON_IsString(type) || !type->valuestring)
        return message;

    if (std::strcmp(type->valuestring, "tts") == 0) {
        const std::string state = json_utils::JsonString(root, "state");
        if (state == "start") {
            message.kind = IncomingMessageKind::kTtsStart;
        } else if (state == "stop") {
            message.kind = IncomingMessageKind::kTtsStop;
        } else if (state == "sentence_start") {
            message.text = json_utils::JsonString(root, "text");
            if (!message.text.empty())
                message.kind = IncomingMessageKind::kTtsSentenceStart;
        }
        return message;
    }

    if (std::strcmp(type->valuestring, "stt") == 0) {
        message.text = json_utils::JsonString(root, "text");
        if (!message.text.empty())
            message.kind = IncomingMessageKind::kSttText;
        return message;
    }

    if (std::strcmp(type->valuestring, "llm") == 0) {
        message.emotion = json_utils::JsonString(root, "emotion");
        if (!message.emotion.empty())
            message.kind = IncomingMessageKind::kLlmEmotion;
        return message;
    }

    if (std::strcmp(type->valuestring, "alert") == 0) {
        message.status  = json_utils::JsonString(root, "status");
        message.message = json_utils::JsonString(root, "message");
        message.emotion = json_utils::JsonString(root, "emotion");
        message.kind =
            message.message.empty() ? IncomingMessageKind::kAlertMissingMessage : IncomingMessageKind::kAlert;
        return message;
    }

    if (std::strcmp(type->valuestring, "calendar_proposal") == 0) {
        message.ticket = json_utils::JsonString(root, "ticket");
        cJSON* proposal = cJSON_GetObjectItem(root, "proposal");
        if (!cJSON_IsObject(proposal))
            return message;
        message.title    = json_utils::JsonString(proposal, "title");
        message.start    = json_utils::JsonString(proposal, "start");
        message.end      = json_utils::JsonString(proposal, "end");
        message.location = json_utils::JsonString(proposal, "location");
        message.timezone = json_utils::JsonString(proposal, "timezone");
        cJSON* all_day   = cJSON_GetObjectItem(proposal, "allDay");
        message.all_day  = cJSON_IsTrue(all_day);
        if (!message.ticket.empty() && !message.title.empty() && !message.start.empty() && !message.end.empty())
            message.kind = IncomingMessageKind::kCalendarProposal;
        return message;
    }

    if (std::strcmp(type->valuestring, "calendar") == 0) {
        const std::string state = json_utils::JsonString(root, "state");
        if (state == "created") {
            message.message = "Event created";
            message.kind    = IncomingMessageKind::kCalendarCreated;
        } else if (state == "cancelled") {
            message.message = "Event cancelled";
            message.kind    = IncomingMessageKind::kCalendarCancelled;
        }
        return message;
    }

    return message;
}

}  // namespace xiaozhi
