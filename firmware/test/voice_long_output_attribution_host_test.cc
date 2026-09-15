#include <algorithm>
#include <cassert>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

// Offline stress model bound to the production seams by
// run_voice_long_output_attribution_test.sh. It intentionally does not use
// FreeRTOS, codecs, wall-clock time, a provider, or a serial device.
class LongOutputAttributionModel {
   public:
    static constexpr std::size_t kUiQueueCapacity = 64;
    static constexpr std::size_t kPlaybackQueueCapacity = 2;
    static constexpr std::size_t kDecodeQueueCapacity = 240;
    static constexpr std::size_t kEncodeQueueCapacity = 2;
    static constexpr std::size_t kSendQueueCapacity = 240;

    void StartTurn(int turn) {
        assert(turn == next_turn_);
        listening_ = true;
        voice_processing_ = true;
        active_turn_ = turn;
        ++next_turn_;
        ++listen_start_count_;
    }

    void StopInputAndStartLongOutput() {
        assert(listening_ && voice_processing_);
        listening_ = false;
        voice_processing_ = false;
        pending_listen_after_playback_ = false;
        ++turn_complete_count_;
    }

    void QueueOutputPartial() {
        assert(!listening_);
        // Each partial changes the snapshot, but production PostCoalesced
        // permits only one pending XiaozhiChanged event.
        if (!ui_change_pending_) {
            assert(ui_queue_ < kUiQueueCapacity);
            ++ui_queue_;
            ui_change_pending_ = true;
        }
        ++partial_count_;
    }

    void QueueAudioPacket() {
        assert(!listening_);
        if (decode_queue_ < kDecodeQueueCapacity)
            ++decode_queue_;
        if (encode_queue_ < kEncodeQueueCapacity)
            ++encode_queue_;
        if (send_queue_ < kSendQueueCapacity)
            ++send_queue_;
        max_decode_queue_ = std::max(max_decode_queue_, decode_queue_);
        max_encode_queue_ = std::max(max_encode_queue_, encode_queue_);
        max_send_queue_ = std::max(max_send_queue_, send_queue_);
    }

    void DrainOneAudioStep() {
        if (decode_queue_ > 0 && playback_queue_ < kPlaybackQueueCapacity) {
            --decode_queue_;
            ++playback_queue_;
        }
        if (playback_queue_ > 0 && !playback_active_) {
            --playback_queue_;
            playback_active_ = true;
        }
        // Model the synchronous WriteXiaozhiPcm boundary completing on the
        // next deterministic step.
        if (playback_active_)
            playback_active_ = false;
        if (encode_queue_ > 0 && send_queue_ < kSendQueueCapacity) {
            --encode_queue_;
            ++send_queue_;
        }
        if (send_queue_ > 0)
            --send_queue_;
        max_playback_queue_ = std::max(max_playback_queue_, playback_queue_);
    }

    void QueueDecodedPlaybackFrame() {
        assert(playback_queue_ < kPlaybackQueueCapacity);
        ++playback_queue_;
        max_playback_queue_ = std::max(max_playback_queue_, playback_queue_);
    }

    void BeginInFlightPlaybackWrite() {
        assert(playback_queue_ > 0 && !playback_active_);
        --playback_queue_;
        playback_active_ = true;
    }

    void FinishInFlightPlaybackWrite() {
        assert(playback_active_);
        playback_active_ = false;
    }

    void CompleteTtsStop() { pending_listen_after_playback_ = true; }

    bool WaitForPlaybackQueueEmptyZero() const {
        return decode_queue_ == 0 && playback_queue_ == 0 && !decode_active_ && !playback_active_;
    }

    bool PollRearm() {
        ++rearm_poll_count_;
        if (!pending_listen_after_playback_ || !WaitForPlaybackQueueEmptyZero())
            return false;
        pending_listen_after_playback_ = false;
        listening_ = true;
        voice_processing_ = true;
        ++listen_start_count_;
        return true;
    }

    void ConsumeUiEvent() {
        if (ui_queue_ == 0)
            return;
        --ui_queue_;
        ui_change_pending_ = false;
    }

    void QueueButtonEvent() {
        assert(ui_queue_ < kUiQueueCapacity);
        ++ui_queue_;
        ++button_event_count_;
    }

    void InterruptBeforeRearm() {
        pending_listen_after_playback_ = false;
        listening_ = false;
        voice_processing_ = false;
        ++interrupt_count_;
    }

    bool listening() const { return listening_; }
    bool voice_processing() const { return voice_processing_; }
    std::size_t ui_queue() const { return ui_queue_; }
    std::size_t partial_count() const { return partial_count_; }
    std::size_t max_decode_queue() const { return max_decode_queue_; }
    std::size_t max_encode_queue() const { return max_encode_queue_; }
    std::size_t max_send_queue() const { return max_send_queue_; }
    std::size_t max_playback_queue() const { return max_playback_queue_; }
    int listen_start_count() const { return listen_start_count_; }
    int turn_complete_count() const { return turn_complete_count_; }
    int interrupt_count() const { return interrupt_count_; }

   private:
    bool listening_ = false;
    bool voice_processing_ = false;
    bool pending_listen_after_playback_ = false;
    bool decode_active_ = false;
    bool playback_active_ = false;
    bool ui_change_pending_ = false;
    std::size_t ui_queue_ = 0;
    std::size_t decode_queue_ = 0;
    std::size_t playback_queue_ = 0;
    std::size_t encode_queue_ = 0;
    std::size_t send_queue_ = 0;
    std::size_t partial_count_ = 0;
    std::size_t max_decode_queue_ = 0;
    std::size_t max_encode_queue_ = 0;
    std::size_t max_send_queue_ = 0;
    std::size_t max_playback_queue_ = 0;
    int active_turn_ = 0;
    int next_turn_ = 1;
    int listen_start_count_ = 0;
    int turn_complete_count_ = 0;
    int rearm_poll_count_ = 0;
    int button_event_count_ = 0;
    int interrupt_count_ = 0;
};

static void TestLongOutputAcrossRepeatedTurns() {
    LongOutputAttributionModel model;
    constexpr int kTurns = 100;
    constexpr int kPartialsPerTurn = 10;

    for (int turn = 1; turn <= kTurns; ++turn) {
        model.StartTurn(turn);
        model.StopInputAndStartLongOutput();
        for (int partial = 0; partial < kPartialsPerTurn; ++partial) {
            model.QueueOutputPartial();
            model.QueueAudioPacket();
        }
        // Repeated zero-timeout polls cannot rearm while playback/decode work
        // remains, even when UI updates have coalesced.
        model.CompleteTtsStop();
        for (int step = 0; step < 256 && !model.PollRearm(); ++step)
            model.DrainOneAudioStep();
        assert(model.listening());
        assert(model.voice_processing());
        model.ConsumeUiEvent();
    }

    assert(model.partial_count() == static_cast<std::size_t>(kTurns * kPartialsPerTurn));
    assert(model.turn_complete_count() == kTurns);
    assert(model.listen_start_count() == kTurns * 2);
    assert(model.ui_queue() == 0);
    assert(model.max_decode_queue() <= LongOutputAttributionModel::kDecodeQueueCapacity);
    assert(model.max_encode_queue() <= LongOutputAttributionModel::kEncodeQueueCapacity);
    assert(model.max_send_queue() <= LongOutputAttributionModel::kSendQueueCapacity);
    assert(model.max_playback_queue() <= LongOutputAttributionModel::kPlaybackQueueCapacity);
}

static void TestInFlightPlaybackAndInterruptedCaptureFailClosed() {
    LongOutputAttributionModel model;
    model.StartTurn(1);
    model.StopInputAndStartLongOutput();
    model.QueueDecodedPlaybackFrame();
    model.CompleteTtsStop();
    // Put one decoded frame into the synchronous player-write boundary.
    model.BeginInFlightPlaybackWrite();
    assert(!model.PollRearm());
    assert(!model.listening());
    model.FinishInFlightPlaybackWrite();
    assert(model.PollRearm());

    model.StopInputAndStartLongOutput();
    model.CompleteTtsStop();
    model.InterruptBeforeRearm();
    assert(!model.PollRearm());
    assert(!model.listening());
    assert(!model.voice_processing());
    assert(model.interrupt_count() == 1);
}

static void TestUiBackpressureDoesNotDuplicateCoalescedChanges() {
    LongOutputAttributionModel model;
    model.StartTurn(1);
    model.StopInputAndStartLongOutput();
    for (int i = 0; i < 1000; ++i)
        model.QueueOutputPartial();
    assert(model.ui_queue() == 1);
    model.QueueButtonEvent();
    assert(model.ui_queue() == 2);
    model.ConsumeUiEvent();
    model.ConsumeUiEvent();
    assert(model.ui_queue() == 0);
}

int main() {
    TestLongOutputAcrossRepeatedTurns();
    TestInFlightPlaybackAndInterruptedCaptureFailClosed();
    TestUiBackpressureDoesNotDuplicateCoalescedChanges();
    std::cout << "voice_long_output_attribution_host_test: PASS "
                 "(100 turns, 1000 partials, rearm ordering, in-flight playback, "
                 "queue bounds, coalescing, interruption fail-closed)\n";
    return 0;
}
