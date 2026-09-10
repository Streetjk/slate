#include <cassert>
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <deque>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

#include "xiaozhi/service/turn_history.h"

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

// Exercise the shared runtime TurnHistory implementation to eliminate host-test drift.
class TurnAwareHistory {
   public:
    void StartListening() {
        history_.StartListening();
        snap.state = 3;  // kListening
        SyncSnap();
    }

    void SetUserText(const std::string& text) {
        history_.SetUserText(text);
        SyncSnap();
    }

    void SetAssistantText(const std::string& text) {
        history_.SetAssistantText(text);
        snap.state = 4;  // kSpeaking
        SyncSnap();
    }

    XiaozhiSnapshot snap;

   private:
    void SyncSnap() {
        snap.user_text      = history_.user_text();
        snap.assistant_text = history_.assistant_text();
        snap.messages.clear();
        for (const auto& msg : history_.messages()) {
            snap.messages.push_back({msg.role, msg.text});
        }
    }

    xiaozhi::TurnHistory history_;
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

    // 5. Direct shared TurnHistory runtime unit test
    {
        xiaozhi::TurnHistory th;
        th.StartListening();
        assert(th.messages().empty());
        assert(!th.turn_has_user());
        assert(!th.turn_has_assistant());

        // Output-before-input ordering test directly on TurnHistory
        th.SetAssistantText("Answer first");
        assert(th.messages().size() == 1);
        assert(th.messages()[0].role == "assistant");
        assert(th.messages()[0].text == "Answer first");
        assert(th.turn_has_assistant());
        assert(!th.turn_has_user());

        th.SetUserText("Question second");
        assert(th.messages().size() == 2);
        assert(th.messages()[0].role == "user");
        assert(th.messages()[0].text == "Question second");
        assert(th.messages()[1].role == "assistant");
        assert(th.messages()[1].text == "Answer first");
        assert(th.turn_has_user());
        assert(th.turn_has_assistant());

        // Test TrimMessages cap
        for (int i = 0; i < 20; ++i) {
            th.messages().push_back({"user", "msg " + std::to_string(i)});
        }
        assert(th.messages().size() > 12);
        th.TrimMessages();
        assert(th.messages().size() == 12);

        th.Clear();
        assert(th.messages().empty());
        assert(!th.turn_has_user());
        assert(!th.turn_has_assistant());
    }

    // 6. Multi-turn sequential soak test (10 sequential turns with streaming and trimming)
    {
        TurnAwareHistory history;
        const int kTurns = 10;
        for (int turn = 1; turn <= kTurns; ++turn) {
            history.StartListening();
            // User speaks
            std::string user_msg = "Turn " + std::to_string(turn) + " question: 今日は何曜日？";
            history.SetUserText(user_msg);

            // Assistant streams 3 progressive chunks
            history.SetAssistantText("Turn " + std::to_string(turn) + " answer: ");
            history.SetAssistantText("Turn " + std::to_string(turn) + " answer: 今日は");
            history.SetAssistantText("Turn " + std::to_string(turn) + " answer: 今日は火曜日です。");

            // Verify bubble ordering invariant: user bubble always precedes assistant bubble
            assert(history.snap.messages.size() >= 2);
            size_t n = history.snap.messages.size();
            assert(history.snap.messages[n - 2].role == "user");
            assert(history.snap.messages[n - 1].role == "assistant");
            assert(history.snap.messages[n - 2].text == user_msg);
            assert(history.snap.messages[n - 1].text == "Turn " + std::to_string(turn) + " answer: 今日は火曜日です。");
        }
    }

    // 7. Event coalescing and queue backpressure verification
    // Models the exact contract of evt::PostCoalesced and s_xiaozhi_changed_pending in event_bus.cc
    {
        class HostCoalescingEventBus {
           public:
            enum { kCapacity = 64 };

            bool Post(int kind, int timeout_ms = 0) {
                std::unique_lock<std::mutex> lock(mutex_);
                if (queue_.size() >= kCapacity) {
                    if (timeout_ms <= 0) return false;
                    auto deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeout_ms);
                    if (!not_full_.wait_until(lock, deadline, [this] { return queue_.size() < kCapacity; })) {
                        return false;
                    }
                }
                queue_.push_back(kind);
                if (queue_.size() > max_depth_seen_) {
                    max_depth_seen_ = queue_.size();
                }
                not_empty_.notify_one();
                return true;
            }

            bool PostCoalesced(int kind, int timeout_ms = 0) {
                if (kind == 1) { // 1 = kXiaozhiChanged
                    if (xiaozhi_changed_pending_.exchange(true, std::memory_order_acq_rel)) {
                        return true; // Coalesced, no queue entry added
                    }
                    if (!Post(kind, timeout_ms)) {
                        xiaozhi_changed_pending_.store(false, std::memory_order_release);
                        return false;
                    }
                    return true;
                }
                return Post(kind, timeout_ms);
            }

            bool Wait(int* out, int timeout_ms = 50) {
                std::unique_lock<std::mutex> lock(mutex_);
                auto deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeout_ms);
                if (!not_empty_.wait_until(lock, deadline, [this] { return !queue_.empty(); })) {
                    return false;
                }
                *out = queue_.front();
                queue_.pop_front();
                if (*out == 1) {
                    xiaozhi_changed_pending_.store(false, std::memory_order_release);
                }
                not_full_.notify_one();
                return true;
            }

            bool IsXiaozhiPending() const {
                return xiaozhi_changed_pending_.load(std::memory_order_acquire);
            }

            size_t Size() const {
                std::lock_guard<std::mutex> lock(mutex_);
                return queue_.size();
            }

            size_t MaxDepthSeen() const {
                std::lock_guard<std::mutex> lock(mutex_);
                return max_depth_seen_;
            }

           private:
            mutable std::mutex              mutex_;
            std::condition_variable         not_empty_;
            std::condition_variable         not_full_;
            std::deque<int>                 queue_;
            size_t                          max_depth_seen_ = 0;
            std::atomic<bool>               xiaozhi_changed_pending_{false};
        };

        // 7A. Deterministic state transition verification
        {
            HostCoalescingEventBus bus;
            assert(!bus.IsXiaozhiPending());
            assert(bus.Size() == 0);

            // First post: state changes false -> true, queue size becomes 1
            assert(bus.PostCoalesced(1));
            assert(bus.IsXiaozhiPending());
            assert(bus.Size() == 1);

            // Rapid streaming burst: 50 successive posts while pending
            for (int i = 0; i < 50; ++i) {
                assert(bus.PostCoalesced(1));
            }
            // Invariant: all 50 were coalesced, queue size remains strictly 1
            assert(bus.IsXiaozhiPending());
            assert(bus.Size() == 1);

            // User presses button (kind 2): immediately queued, bypassing coalescing
            assert(bus.Post(2));
            assert(bus.Size() == 2);

            // Dequeue UI changed event: state changes true -> false
            int evt = 0;
            assert(bus.Wait(&evt));
            assert(evt == 1);
            assert(!bus.IsXiaozhiPending());
            assert(bus.Size() == 1);

            // Second post after dequeue: state changes false -> true, queue size becomes 2
            assert(bus.PostCoalesced(1));
            assert(bus.IsXiaozhiPending());
            assert(bus.Size() == 2);

            // Dequeue button event: kind is 2, pending flag remains true
            assert(bus.Wait(&evt));
            assert(evt == 2);
            assert(bus.IsXiaozhiPending());
            assert(bus.Size() == 1);

            // Dequeue second UI changed event: state changes true -> false
            assert(bus.Wait(&evt));
            assert(evt == 1);
            assert(!bus.IsXiaozhiPending());
            assert(bus.Size() == 0);

            // Queue full rollback verification:
            // Fill queue to capacity (64) with button events
            for (size_t i = 0; i < HostCoalescingEventBus::kCapacity; ++i) {
                assert(bus.Post(2));
            }
            assert(bus.Size() == 64);
            // PostCoalesced must fail closed and roll back pending flag to false
            assert(!bus.PostCoalesced(1, 0));
            assert(!bus.IsXiaozhiPending());

            // Clear queue
            for (size_t i = 0; i < 64; ++i) {
                assert(bus.Wait(&evt));
            }
            assert(bus.Size() == 0);
        }

        // 7B. Multi-threaded concurrency stress test:
        // 3 concurrent producers (2 UI streaming producers, 1 button click producer)
        // and 1 UI consumer thread running concurrently
        {
            HostCoalescingEventBus bus;
            std::atomic<bool> start_signal{false};
            std::atomic<int> ui_posts_attempted{0};

            // Producer 1: 500 rapid UI snapshot updates
            std::thread producer1([&]() {
                while (!start_signal.load(std::memory_order_acquire)) {}
                for (int i = 0; i < 500; ++i) {
                    if (bus.PostCoalesced(1)) ui_posts_attempted++;
                }
            });

            // Producer 2: 500 rapid UI snapshot updates
            std::thread producer2([&]() {
                while (!start_signal.load(std::memory_order_acquire)) {}
                for (int i = 0; i < 500; ++i) {
                    if (bus.PostCoalesced(1)) ui_posts_attempted++;
                }
            });

            // Producer 3: 10 user button events spaced out
            std::thread producer3([&]() {
                while (!start_signal.load(std::memory_order_acquire)) {}
                for (int i = 0; i < 10; ++i) {
                    std::this_thread::sleep_for(std::chrono::milliseconds(1));
                    assert(bus.Post(100 + i)); // kind 100..109
                }
            });

            // Consumer thread: consumes events until all 10 button events are received
            std::vector<int> received_buttons;
            int ui_changes_received = 0;

            std::thread consumer([&]() {
                while (received_buttons.size() < 10) {
                    int kind = 0;
                    if (bus.Wait(&kind, 100)) {
                        if (kind == 1) {
                            ui_changes_received++;
                        } else if (kind >= 100) {
                            received_buttons.push_back(kind);
                        }
                    }
                }
            });

            // Release all threads
            start_signal.store(true, std::memory_order_release);

            producer1.join();
            producer2.join();
            producer3.join();
            consumer.join();

            // Invariant 1: Queue depth NEVER exceeded capacity (64) under 1000+ concurrent posts
            assert(bus.MaxDepthSeen() <= HostCoalescingEventBus::kCapacity);

            // Invariant 2: ALL 10 button events were received in exact sequence without loss or starvation
            assert(received_buttons.size() == 10);
            for (int i = 0; i < 10; ++i) {
                assert(received_buttons[i] == 100 + i);
            }

            // Invariant 3: UI changes were delivered and coalesced
            assert(ui_changes_received > 0);
        }
    }

    return 0;
}
