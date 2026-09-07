#include <cassert>
#include <string>
#include <vector>

struct XiaozhiMessage {
    std::string role;
    std::string text;
};

struct XiaozhiSnapshot {
    int state = 4;  // kSpeaking
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

int main() {
    XiaozhiSnapshot snap;
    snap.messages.push_back({"user", "Hello"});

    // Initial state: 1 message (user)
    std::string prefix0 = MessagesPrefixKey(snap);
    assert(prefix0.empty());
    assert(!CanUpdateInPlace(false, 0, "", "", snap));

    // After initial rebuild with user message
    size_t rendered_count = 1;
    std::string rendered_prefix = prefix0;
    std::string last_role = "user";
    bool has_bubble = true;

    // Assistant starts speaking: 2nd message appended ("Hel")
    snap.messages.push_back({"assistant", "Hel"});
    // Must rebuild because count changed from 1 to 2
    assert(!CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

    // After assistant bubble is appended:
    rendered_count = 2;
    rendered_prefix = MessagesPrefixKey(snap);
    last_role = "assistant";
    std::string key1 = MessagesKey(snap);

    // Assistant text streams incrementally: "Hello"
    snap.messages.back().text = "Hello";
    std::string key2 = MessagesKey(snap);
    assert(key1 != key2);  // MessagesKey changed
    // In-place update is SAFE:
    assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

    // Assistant text streams incrementally: "Hello world"
    snap.messages.back().text = "Hello world";
    assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

    // Authoritative final turnComplete: "Hello world!"
    snap.messages.back().text = "Hello world!";
    assert(CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

    // Turn completes, new user message added:
    snap.messages.push_back({"user", "Thanks"});
    // In-place update must NOT occur: count changed, last role is user
    assert(!CanUpdateInPlace(has_bubble, rendered_count, rendered_prefix, last_role, snap));

    return 0;
}
