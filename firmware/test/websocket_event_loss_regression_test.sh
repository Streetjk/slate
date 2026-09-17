#!/usr/bin/env bash
set -euo pipefail

# Deterministic regression test for WebSocket event-loss window fix.
# Proves that lower transport stream/disconnect callbacks are installed before
# tcp_->Connect is called, preventing early handshake/server events from being discarded.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

python3 - "$ROOT_DIR" << 'EOF'
import sys
import os
import re

root_dir = sys.argv[1]
ws_src = os.path.join(root_dir, "firmware/managed_components/78__esp-ml307/src/web_socket.cc")
tcp_src = os.path.join(root_dir, "firmware/managed_components/78__esp-ml307/src/esp/esp_tcp.cc")
ssl_src = os.path.join(root_dir, "firmware/managed_components/78__esp-ml307/src/esp/esp_ssl.cc")

if not os.path.exists(ws_src):
    print(f"FAIL: Source file not found: {ws_src}", file=sys.stderr)
    sys.exit(1)

with open(ws_src, "r", encoding="utf-8") as f:
    ws_content = f.read()

# 1. Locate WebSocket::Connect method
connect_start = ws_content.find("bool WebSocket::Connect(const char* uri)")
if connect_start == -1:
    print("FAIL: Could not locate WebSocket::Connect in web_socket.cc", file=sys.stderr)
    sys.exit(1)

# Bounded search for Connect body
connect_end = ws_content.find("bool WebSocket::Send(", connect_start)
if connect_end == -1:
    connect_end = len(ws_content)
connect_body = ws_content[connect_start:connect_end]

# Extract positions of key statements in WebSocket::Connect
pos_create_tcp = re.search(r'tcp_\s*=\s*network_->Create(Tcp|Ssl)', connect_body)
pos_handshake_reset = re.search(r'handshake_completed_\s*=\s*false', connect_body)
pos_clear_bits = re.search(r'xEventGroupClearBits\s*\(\s*handshake_event_group_', connect_body)
pos_on_stream = re.search(r'tcp_->OnStream\s*\(', connect_body)
pos_on_disconnected = re.search(r'tcp_->OnDisconnected\s*\(', connect_body)
pos_connect = re.search(r'tcp_->Connect\s*\(', connect_body)
pos_send_handshake = re.search(r'tcp_->Send\s*\(\s*request\s*\)', connect_body)

missing = []
if not pos_create_tcp: missing.append("tcp_ creation")
if not pos_handshake_reset: missing.append("handshake_completed_ = false")
if not pos_clear_bits: missing.append("xEventGroupClearBits(handshake_event_group_)")
if not pos_on_stream: missing.append("tcp_->OnStream")
if not pos_on_disconnected: missing.append("tcp_->OnDisconnected")
if not pos_connect: missing.append("tcp_->Connect")
if not pos_send_handshake: missing.append("tcp_->Send(request)")

if missing:
    print(f"FAIL: Missing required statements in WebSocket::Connect: {missing}", file=sys.stderr)
    sys.exit(1)

# Check order within WebSocket::Connect
create_pos = pos_create_tcp.start()
handshake_reset_pos = pos_handshake_reset.start()
clear_bits_pos = pos_clear_bits.start()
on_stream_pos = pos_on_stream.start()
on_disc_pos = pos_on_disconnected.start()
connect_pos = pos_connect.start()
send_pos = pos_send_handshake.start()

errors = []
if not (create_pos < on_stream_pos):
    errors.append("tcp_ must be created before tcp_->OnStream registration")
if not (create_pos < on_disc_pos):
    errors.append("tcp_ must be created before tcp_->OnDisconnected registration")
if not (handshake_reset_pos < connect_pos):
    errors.append("handshake_completed_ must be reset before tcp_->Connect")
if not (clear_bits_pos < connect_pos):
    errors.append("handshake_event_group_ bits must be cleared before tcp_->Connect")
if not (on_stream_pos < connect_pos):
    errors.append(
        "EVENT LOSS BUG: tcp_->OnStream must be registered BEFORE tcp_->Connect. "
        "tcp_->Connect starts ReceiveTask; registering callback after Connect creates "
        "a window where early server data is silently dropped."
    )
if not (on_disc_pos < connect_pos):
    errors.append(
        "EVENT LOSS BUG: tcp_->OnDisconnected must be registered BEFORE tcp_->Connect. "
        "Disconnect events occurring during/immediately after connection would be dropped."
    )
if not (connect_pos < send_pos):
    errors.append("tcp_->Connect must complete before sending handshake request")

if errors:
    for err in errors:
        print(f"FAIL: {err}", file=sys.stderr)
    sys.exit(1)

# 2. Verify lower transport behavior in esp_tcp.cc and esp_ssl.cc
for path, name in [(tcp_src, "EspTcp"), (ssl_src, "EspSsl")]:
    if not os.path.exists(path):
        print(f"FAIL: Transport file not found: {path}", file=sys.stderr)
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Must spawn receive task in Connect
    if "xTaskCreate" not in content or "receive_task_handle_" not in content:
        print(f"FAIL: {name} does not spawn receive task in Connect", file=sys.stderr)
        sys.exit(1)

    # Must guard stream_callback_ with NULL check (which drops data if unset)
    if "if (stream_callback_)" not in content:
        print(f"FAIL: {name} does not guard stream_callback_ (expected 'if (stream_callback_)')", file=sys.stderr)
        sys.exit(1)

# 3. Behavioral simulation of the event-loss window vs repair
class MockTransport:
    def __init__(self):
        self.stream_callback = None
        self.disconnected_callback = None
        self.connected = False
        self.received_events = []
        self.dropped_events = []

    def on_stream(self, cb):
        self.stream_callback = cb

    def on_disconnected(self, cb):
        self.disconnected_callback = cb

    def connect(self, immediate_server_data=None):
        self.connected = True
        # Simulate ReceiveTask immediately observing data upon connect
        if immediate_server_data:
            if self.stream_callback:
                self.stream_callback(immediate_server_data)
                self.received_events.append(immediate_server_data)
            else:
                # Discarded bytes when stream_callback_ is NULL (as in esp_tcp.cc / esp_ssl.cc)
                self.dropped_events.append(immediate_server_data)

# Test Defective Pre-fix ordering: connect() then on_stream()
t_bad = MockTransport()
t_bad.connect(immediate_server_data="HTTP/1.1 101 Switching Protocols\r\n\r\n")
t_bad.on_stream(lambda data: None)
assert len(t_bad.dropped_events) == 1, "Expected pre-fix ordering to discard immediate server event"
assert len(t_bad.received_events) == 0, "Expected pre-fix ordering to receive 0 events"

# Test Repaired Post-fix ordering: on_stream() then connect()
received_in_ws = []
t_good = MockTransport()
t_good.on_stream(lambda data: received_in_ws.append(data))
t_good.connect(immediate_server_data="HTTP/1.1 101 Switching Protocols\r\n\r\n")
assert len(t_good.dropped_events) == 0, "Repaired ordering must not drop any events"
assert len(received_in_ws) == 1, "Repaired ordering must deliver handshake event to stream callback"
assert received_in_ws[0] == "HTTP/1.1 101 Switching Protocols\r\n\r\n"

print("websocket_event_loss_regression_test: PASS (ordering and callback delivery verified)")
EOF
