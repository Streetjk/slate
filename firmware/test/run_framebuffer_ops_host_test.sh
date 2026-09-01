#!/bin/sh
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
test_dir=$(mktemp -d "${TMPDIR:-/tmp}/slate-framebuffer-test.XXXXXX")
trap 'rm -rf "$test_dir"' EXIT HUP INT TERM

"${CXX:-c++}" -std=c++17 -Wall -Wextra -Werror \
    -I"$root_dir/firmware/main" \
    "$root_dir/firmware/main/drivers/display/framebuffer_ops.cc" \
    "$root_dir/firmware/test/framebuffer_ops_host_test.cc" \
    -o "$test_dir/framebuffer_ops_host_test"
"$test_dir/framebuffer_ops_host_test"
echo "framebuffer_ops_host_test: PASS"
