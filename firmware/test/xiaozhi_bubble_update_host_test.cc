#include <cassert>
#include <string>
#include <vector>

struct XiaozhiMessage {
    std::string role;
    std::string text;
};

struct XiaozhiSnapshot {
    int state = 4;  // kSpeaking
    std::string user_text;
    std::string assistant_text;
    std::vector<XiaozhiMessage> messages;
};

std::string MessagesKey(const XiaozhiSnapshot& snap) {
    std::string key;
    for (const auto& msg : snap.messages) {
        key += msg.role;
        key.push_back('\x1F');
        key += msg.text;
        key.push_back('\x1E');
    }
    return key;
}

std::string MessagesPrefixKey(const XiaozhiSnapshot& snap) {
    if (snap.messages.size() <= 1)
        return "";
    std::string key;
    for (size_t i = 0; i + 1 < snap.messages.size(); ++i) {
        key += snap.messages[i].role;
        key.push_back('\x1F');
        key += snap.messages[i].text;
        key.push_back('\x1E');
    }
    return key;
}

bool CanUpdateInPlace(
    bool has_last_bubble,
    size_t rendered_message_count,
    const std::string& rendered_prefix_key,
    const std::string& last_bubble_role,
    const XiaozhiSnapshot& snap) {
    return has_last_bubble &&
           rendered_message_count == snap.messages.size() &&
           !snap.messages.empty() &&
           snap.messages.back().role == "assistant" &&
           last_bubble_role == "assistant" &&
           MessagesPrefixKey(snap) == rendered_prefix_key;
}

std::string MergeTranscriptFragment(const std::string& previous, const std::string& incoming) {
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

class TurnAwareHistory {
   public:
    void StartListening() {
        turn_has_user_ = false;
        turn_has_assistant_ = false;
        snap.user_text.clear();
        snap.assistant_text.clear();
        snap.state = 3;  // kListening
    }

    void SetUserText(const std::string& text) {
        if (text.empty())
            return;
        if (turn_has_user_ && turn_has_assistant_) {
            turn_has_user_ = false;
            turn_has_assistant_ = false;
            snap.user_text.clear();
            snap.assistant_text.clear();
        }

        std::string previous;
        if (turn_has_user_) {
            if (turn_has_assistant_ && snap.messages.size() >= 2) {
                previous = snap.messages[snap.messages.size() - 2].text;
            } else if (!snap.messages.empty() && snap.messages.back().role == "user") {
                previous = snap.messages.back().text;
            }
        }

        const std::string merged = MergeTranscriptFragment(previous, text);
        snap.user_text = merged;

        if (!merged.empty()) {
            if (turn_has_user_) {
                if (turn_has_assistant_ && snap.messages.size() >= 2) {
                    snap.messages[snap.messages.size() - 2].text = merged;
                } else if (!snap.messages.empty() && snap.messages.back().role == "user") {
                    snap.messages.back().text = merged;
                }
            } else {
                if (turn_has_assistant_ && !snap.messages.empty() && snap.messages.back().role == "assistant") {
                    snap.messages.insert(snap.messages.end() - 1, {"user", merged});
                } else {
                    snap.messages.push_back({"user", merged});
                }
                turn_has_user_ = true;
            }
        }
    }

    void SetAssistantText(const std::string& text) {
        if (text.empty())
            return;
        std::string previous;
        if (turn_has_assistant_ && !snap.messages.empty() && snap.messages.back().role == "assistant") {
            previous = snap.messages.back().text;
        }

        const std::string merged = MergeTranscriptFragment(previous, text);
        snap.assistant_text = merged;

        if (!merged.empty()) {
            if (turn_has_assistant_ && !snap.messages.empty() && snap.messages.back().role == "assistant") {
                snap.messages.back().text = merged;
            } else {
                snap.messages.push_back({"assistant", merged});
                turn_has_assistant_ = true;
            }
        }
        snap.state = 4;  // kSpeaking
    }

    struct XiaozhiSnapshot snap;
    bool turn_has_user_ = false;
    bool turn_has_assistant_ = false;
};

int main() {
    // 1. Standard arrival order test
    {
        XiaozhiSnapshot snap;
        snap.messages.push_back({"user", "Hello"});

        std::string prefix0 = MessagesPrefixKey(snap);
        assert(prefix0.empty());
        assert(!CanUpdateInPlace(false, 0, "", "", snap));

        size_t rendered_count = 1;
        std::string rendered_prefix = prefix0;
        std::string last_role = "user";
        bool has_bubble = true;

        snap.messages.push_back({"assistant", "Hel"});
        assert(!CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

        rendered_count = 2;
        rendered_prefix = MessagesPrefixKey(snap);
        last_role = "assistant";
        std::string key1 = MessagesKey(snap);

        snap.messages.back().text = "Hello";
        std::string key2 = MessagesKey(snap);
        assert(key1 != key2);
        assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

        snap.messages.back().text = "Hello world";
        assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

        snap.messages.back().text = "Hello world!";
        assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

        snap.messages.push_back({"user", "Thanks"});
        assert(!CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));
    }

    // 2. Output-before-input arrival order test (assistant arrives before user)
    {
        TurnAwareHistory history;
        history.StartListening();

        // Assistant output arrives first
        history.SetAssistantText("Hel");
        assert(history.snap.messages.size() == 1);
        assert(history.snap.messages[0].role == "assistant");
        assert(history.snap.messages[0].text == "Hel");

        // Assistant streams more text before user text arrives
        history.SetAssistantText("Hello");
        assert(history.snap.messages.size() == 1);
        assert(history.snap.messages[0].text == "Hello");

        // Now user text arrives late (output-before-input callback ordering)
        history.SetUserText("What is the time?");
        assert(history.snap.messages.size() == 2);
        // User bubble MUST be first, assistant bubble MUST be second:
        assert(history.snap.messages[0].role == "user");
        assert(history.snap.messages[0].text == "What is the time?");
        assert(history.snap.messages[1].role == "assistant");
        assert(history.snap.messages[1].text == "Hello");

        // Check in-place update compatibility:
        size_t rendered_count = 2;
        std::string rendered_prefix = MessagesPrefixKey(history.snap);
        std::string last_role = "assistant";
        bool has_bubble = true;

        // Assistant continues streaming in-place:
        history.SetAssistantText("Hello, it is 10 AM.");
        assert(history.snap.messages.size() == 2);
        assert(history.snap.messages[0].role == "user");
        assert(history.snap.messages[1].role == "assistant");
        assert(history.snap.messages[1].text == "Hello, it is 10 AM.");
        assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, history.snap));

        // Turn complete: exactly one user bubble and one assistant bubble
        assert(history.snap.messages.size() == 2);
    }

    // 3. Japanese UTF-8 preservation with delta and cumulative fragments
    {
        TurnAwareHistory history;
        history.StartListening();

        const std::string sample_user = "今日は何曜日ですか？";
        const std::string sample_assistant = "今日は火曜日です。 ひらがな カタカナ 日本語";

        // Cumulative user input
        history.SetUserText("今日");
        assert(history.snap.messages.size() == 1);
        assert(history.snap.messages[0].text == "今日");

        history.SetUserText("今日は何曜日ですか？");
        assert(history.snap.messages.size() == 1);
        assert(history.snap.messages[0].text == sample_user);

        // Streaming assistant output with Japanese
        history.SetAssistantText("今日");
        assert(history.snap.messages.size() == 2);
        assert(history.snap.messages[0].role == "user");
        assert(history.snap.messages[1].role == "assistant");

        history.SetAssistantText("今日は火曜日です。");
        assert(history.snap.messages.size() == 2);
        assert(history.snap.messages[1].text == "今日は火曜日です。");

        history.SetAssistantText(sample_assistant);
        assert(history.snap.messages.size() == 2);
        assert(history.snap.messages[1].text == sample_assistant);

        // Verify UTF-8 byte integrity
        assert(history.snap.messages[0].text == sample_user);
        assert(history.snap.messages[1].text == sample_assistant);
    }

    // 4. Multi-turn isolation and interruption test
    {
        TurnAwareHistory history;
        history.StartListening();
        history.SetUserText("Turn 1 Question");
        history.SetAssistantText("Turn 1 Answer");
        assert(history.snap.messages.size() == 2);

        // Turn 2 begins with listening
        history.StartListening();
        history.SetUserText("Turn 2 Question");
        assert(history.snap.messages.size() == 3);
        assert(history.snap.messages[2].role == "user");
        assert(history.snap.messages[2].text == "Turn 2 Question");

        history.SetAssistantText("Turn 2 Answer");
        assert(history.snap.messages.size() == 4);
        assert(history.snap.messages[3].role == "assistant");
        assert(history.snap.messages[3].text == "Turn 2 Answer");

        // Verify no duplicate bubbles across turns
        assert(history.snap.messages[0].role == "user");
        assert(history.snap.messages[1].role == "assistant");
        assert(history.snap.messages[2].role == "user");
        assert(history.snap.messages[3].role == "assistant");
    }

    return 0;
}
