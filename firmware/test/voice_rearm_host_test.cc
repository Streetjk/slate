#include <cassert>
#include <iostream>
#include <string>
#include <vector>

// Deterministic host model of the production listen-rearm seam in
// xiaozhi_service.cc and audio_service.cc. This intentionally does not use
// wall-clock sleeps, hardware, FreeRTOS, codecs, or a serial device.
class VoiceRearmModel {
   public:
    void StartSpeaking() {
        voice_processing = false;
        pending_listen_after_playback = false;
        decode_queue = 0;
        decode_active = false;
        playback_active = false;
        events.push_back("tts_start");
    }

    void QueuePlaybackFrames(int count) {
        assert(count >= 0);
        playback_queue += count;
    }

    void CompleteSpeaking() {
        pending_listen_after_playback = true;
        events.push_back("tts_stop");
    }

    // Mirrors OutputTask's pop-then-synchronous WriteXiaozhiPcm boundary.
    void BeginPlaybackWrite(bool block_write) {
        if (playback_queue == 0 || playback_active)
            return;
        --playback_queue;
        playback_active = true;
        write_blocked = block_write;
        events.push_back("playback_write_begin");
    }

    void FinishPlaybackWrite() {
        if (!playback_active || write_blocked)
            return;
        playback_active = false;
        events.push_back("playback_write_done");
    }

    void ReleaseBlockedPlaybackWrite() {
        assert(playback_active && write_blocked);
        write_blocked = false;
        playback_active = false;
        events.push_back("playback_write_done");
    }

    bool PollListenRearm() {
        if (!pending_listen_after_playback || !PlaybackDrainIdle())
            return false;
        pending_listen_after_playback = false;
        voice_processing = true;
        send_start_listening_count++;
        events.push_back("send_start_listening");
        events.push_back("voice_processing=true");
        return true;
    }

    void InputEncodeTick() {
        if (voice_processing) {
            input_encode_ticks++;
            events.push_back("input_encode_tick");
        }
    }

    bool PlaybackDrainIdle() const {
        // This is the production WaitForPlaybackQueueEmpty(0) predicate.
        return decode_queue == 0 && playback_queue == 0 && !decode_active && !playback_active;
    }

    bool voice_processing = true;
    bool pending_listen_after_playback = false;
    bool decode_active = false;
    bool playback_active = false;
    bool write_blocked = false;
    int decode_queue = 0;
    int playback_queue = 0;
    int encode_queue = 0;
    int send_queue = 0;
    int send_start_listening_count = 0;
    int input_encode_ticks = 0;
    std::vector<std::string> events;
};

static void AssertEventOrder(const std::vector<std::string>& events) {
    const auto index_of = [&events](const std::string& event) {
        for (size_t i = 0; i < events.size(); ++i) {
            if (events[i] == event)
                return i;
        }
        return events.size();
    };
    assert(index_of("tts_stop") < index_of("playback_write_done"));
    assert(index_of("playback_write_done") < index_of("send_start_listening"));
    assert(index_of("send_start_listening") < index_of("input_encode_tick"));
}

static void TestLongPlaybackRearmsAfterTheFinalWrite() {
    VoiceRearmModel model;
    model.StartSpeaking();
    model.QueuePlaybackFrames(32);
    model.CompleteSpeaking();

    // Drain all but the last frame, then leave the final PCM write in flight.
    for (int i = 0; i < 31; ++i) {
        model.BeginPlaybackWrite(false);
        model.FinishPlaybackWrite();
    }
    model.BeginPlaybackWrite(true);
    assert(model.playback_queue == 0);
    assert(!model.PollListenRearm());
    assert(model.pending_listen_after_playback);
    assert(model.send_start_listening_count == 0);

    model.ReleaseBlockedPlaybackWrite();
    assert(model.PollListenRearm());
    model.InputEncodeTick();
    assert(model.send_start_listening_count == 1);
    assert(model.input_encode_ticks == 1);
    AssertEventOrder(model.events);
}

static void TestBlockedDrainDoesNotPretendToBeReady() {
    VoiceRearmModel model;
    model.StartSpeaking();
    model.QueuePlaybackFrames(1);
    model.CompleteSpeaking();

    // A write that does not return cannot be treated as an idle playback
    // pipeline, even though the queue was popped.
    model.BeginPlaybackWrite(true);
    assert(!model.PollListenRearm());
    assert(model.pending_listen_after_playback);
    assert(!model.voice_processing);
    assert(model.send_start_listening_count == 0);
}

static void TestEncodeAndSendLeftoverAreCharacterized() {
    VoiceRearmModel model;
    model.StartSpeaking();
    model.CompleteSpeaking();
    model.encode_queue = 1;
    model.send_queue = 1;

    // The production predicate intentionally excludes encode/send queues.
    // Record that behavior, then require the actual input tick after re-arm.
    assert(model.PollListenRearm());
    model.InputEncodeTick();
    assert(model.input_encode_ticks == 1);
    assert(model.encode_queue == 1);
    assert(model.send_queue == 1);
}

int main() {
    TestLongPlaybackRearmsAfterTheFinalWrite();
    TestBlockedDrainDoesNotPretendToBeReady();
    TestEncodeAndSendLeftoverAreCharacterized();
    std::cout << "voice_rearm_host_test: PASS (long playback, in-flight write, blocked drain, post-rearm input)\n";
    return 0;
}
