#pragma once

#include <cstddef>
#include <string>
#include <vector>

namespace xiaozhi {

struct TurnMessage {
    std::string role;
    std::string text;
};

using XiaozhiMessage = TurnMessage;

inline std::string MergeTranscriptFragment(const std::string& previous, const std::string& incoming) {
    if (previous.empty())
        return incoming;
    if (incoming.empty() || incoming == previous)
        return previous;
    if (incoming.rfind(previous, 0) == 0)
        return incoming;
    if (previous.size() >= incoming.size() &&
        previous.compare(previous.size() - incoming.size(), incoming.size(), incoming) == 0)
        return previous;

    return previous + incoming;
}

class TurnHistory {
   public:
    static constexpr size_t kMaxMessages = 12;

    void StartListening() {
        turn_has_user_      = false;
        turn_has_assistant_ = false;
        user_text_.clear();
        assistant_text_.clear();
    }

    void ResetTurn() {
        StartListening();
    }

    void Clear() {
        turn_has_user_      = false;
        turn_has_assistant_ = false;
        user_text_.clear();
        assistant_text_.clear();
        messages_.clear();
    }

    bool SetUserText(const std::string& text) {
        if (text.empty())
            return false;
        if (turn_has_user_ && turn_has_assistant_) {
            turn_has_user_      = false;
            turn_has_assistant_ = false;
            user_text_.clear();
            assistant_text_.clear();
        }

        std::string previous;
        if (turn_has_user_) {
            if (turn_has_assistant_ && messages_.size() >= 2) {
                previous = messages_[messages_.size() - 2].text;
            } else if (!messages_.empty() && messages_.back().role == "user") {
                previous = messages_.back().text;
            }
        }

        const std::string merged  = MergeTranscriptFragment(previous, text);
        const bool        changed = (merged != user_text_);
        user_text_                = merged;

        if (!merged.empty()) {
            if (turn_has_user_) {
                if (turn_has_assistant_ && messages_.size() >= 2) {
                    messages_[messages_.size() - 2].text = merged;
                } else if (!messages_.empty() && messages_.back().role == "user") {
                    messages_.back().text = merged;
                }
            } else {
                if (turn_has_assistant_ && !messages_.empty() && messages_.back().role == "assistant") {
                    messages_.insert(messages_.end() - 1, {"user", merged});
                } else {
                    messages_.push_back({"user", merged});
                }
                turn_has_user_ = true;
            }
        }
        TrimMessages();
        return changed;
    }

    bool SetAssistantText(const std::string& text) {
        if (text.empty())
            return false;
        std::string previous;
        if (turn_has_assistant_ && !messages_.empty() && messages_.back().role == "assistant") {
            previous = messages_.back().text;
        }

        const std::string merged  = MergeTranscriptFragment(previous, text);
        const bool        changed = (merged != assistant_text_);
        assistant_text_           = merged;

        if (!merged.empty()) {
            if (turn_has_assistant_ && !messages_.empty() && messages_.back().role == "assistant") {
                messages_.back().text = merged;
            } else {
                messages_.push_back({"assistant", merged});
                turn_has_assistant_ = true;
            }
        }
        TrimMessages();
        return changed;
    }

    void UpsertMessage(const std::string& role, const std::string& text) {
        if (role == "user") {
            if (turn_has_assistant_ && !messages_.empty() && messages_.back().role == "assistant") {
                messages_.insert(messages_.end() - 1, {role, text});
            } else if (!messages_.empty() && messages_.back().role == role) {
                messages_.back().text = text;
            } else {
                messages_.push_back({role, text});
            }
            turn_has_user_ = true;
        } else {
            if (!messages_.empty() && messages_.back().role == role) {
                messages_.back().text = text;
            } else {
                messages_.push_back({role, text});
            }
            turn_has_assistant_ = true;
        }
        TrimMessages();
    }

    void TrimMessages(size_t max_messages = kMaxMessages) {
        if (messages_.size() > max_messages) {
            messages_.erase(messages_.begin(), messages_.begin() + (messages_.size() - max_messages));
        }
    }

    const std::vector<TurnMessage>& messages() const { return messages_; }
    std::vector<TurnMessage>&       messages() { return messages_; }
    const std::string&              user_text() const { return user_text_; }
    const std::string&              assistant_text() const { return assistant_text_; }
    bool                            turn_has_user() const { return turn_has_user_; }
    bool                            turn_has_assistant() const { return turn_has_assistant_; }

   private:
    std::vector<TurnMessage> messages_;
    std::string              user_text_;
    std::string              assistant_text_;
    bool                     turn_has_user_      = false;
    bool                     turn_has_assistant_ = false;
};

}  // namespace xiaozhi
