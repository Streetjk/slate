#!/bin/sh
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
test_dir=$(mktemp -d "${TMPDIR:-/tmp}/slate-xiaozhi-bubble-test.XXXXXX")
trap 'rm -rf "$test_dir"' EXIT HUP INT TERM

"${CXX:-c++}" -std=c++17 -Wall -Wextra -Werror \
    -I"$root_dir/firmware/main" \
    "$root_dir/firmware/test/xiaozhi_bubble_update_host_test.cc" \
    -o "$test_dir/xiaozhi_bubble_update_host_test"
"$test_dir/xiaozhi_bubble_update_host_test"
echo "xiaozhi_bubble_update_host_test: PASS"
