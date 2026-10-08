#!/bin/sh
set -eu

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
root_dir="$(CDPATH= cd -- "$script_dir/../.." && pwd)"

tmp_bin="$(mktemp "${TMPDIR:-/tmp}/connected_sleep_policy_host_test.XXXXXX")"
trap 'rm -f "$tmp_bin"' EXIT INT TERM

${CXX:-c++} -std=c++17 -Wall -Wextra -Werror \
    -fsanitize=undefined -fno-sanitize-recover=undefined \
    -I"$root_dir/firmware/main" \
    "$script_dir/connected_sleep_policy_host_test.cc" \
    -o "$tmp_bin"

"$tmp_bin"

printf '%s\n' "connected_sleep_policy_host_test: PASS"
