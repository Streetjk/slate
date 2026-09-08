#!/usr/bin/env bash
# Deterministic coverage test for Voice AI Japanese font and fallback integration.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_C="$ROOT_DIR/main/resources/fonts/voice_font_16.c"
FALLBACK_C="$ROOT_DIR/main/resources/fonts/zfull_16.c"
THEME_H="$ROOT_DIR/main/ui/theme.h"
CMAKELISTS="$ROOT_DIR/main/CMakeLists.txt"
SCENE_CC="$ROOT_DIR/main/scenes/xiaozhi/xiaozhi_scene.cc"

# 1. Verify font files exist
if [ ! -f "$FONT_C" ]; then
    echo "FAIL: $FONT_C not found" >&2
    exit 1
fi
if [ ! -f "$FALLBACK_C" ]; then
    echo "FAIL: $FALLBACK_C not found" >&2
    exit 1
fi

# 2. Verify provenance, fallback wiring, and CMake/theme integration
python3 - "$FONT_C" "$THEME_H" "$CMAKELISTS" "$SCENE_CC" <<'PY'
import sys
from pathlib import Path

font_c = Path(sys.argv[1]).read_text(encoding="utf-8")
theme_h = Path(sys.argv[2]).read_text(encoding="utf-8")
cmake = Path(sys.argv[3]).read_text(encoding="utf-8")
scene = Path(sys.argv[4]).read_text(encoding="utf-8")

# Provenance and license metadata
assert "firmware/tools/gen_voice_font.sh" in font_c, "Missing generator provenance in header"
assert "Zfull-GB.ttf" in font_c, "Missing source font provenance in header"
assert "Fallback: Zfull_16" in font_c, "Missing fallback declaration in header"
assert "License: Compatible with project font assets" in font_c, "Missing license declaration in header"

# Fallback struct field wiring
assert ".fallback = &Zfull_16" in font_c, "Voice_Font_16 .fallback pointer to Zfull_16 missing"

# Theme header declaration
assert "LV_FONT_DECLARE(Voice_Font_16)" in theme_h, "Voice_Font_16 not declared in theme.h"

# CMakeLists inclusion
assert "resources/fonts/voice_font_16.c" in cmake, "voice_font_16.c not included in main CMakeLists.txt"

# Scene bubble usage
assert "&Voice_Font_16" in scene, "xiaozhi_scene.cc does not use Voice_Font_16 for speech bubbles"

# Source footprint check: under 250 KB
size_kb = len(font_c.encode("utf-8")) / 1024
assert size_kb < 250, f"Font source file size ({size_kb:.1f} KB) exceeds 250 KB threshold"
print(f"Font asset size: {size_kb:.1f} KB source")
PY

# 3. Deterministic codepoint coverage assertion
python3 - "$FONT_C" "$FALLBACK_C" <<'PY'
import sys
import re

font_c = open(sys.argv[1], "r", encoding="utf-8").read()
fallback_c = open(sys.argv[2], "r", encoding="utf-8").read()

def extract_codepoints(text):
    return {int(m.group(1), 16) for m in re.finditer(r'/\*\s*U\+([0-9A-Fa-f]+)\s+"([^"]*)"\s*\*/', text)}

voice_cps = extract_codepoints(font_c)
fallback_cps = extract_codepoints(fallback_c)
total_cps = voice_cps | fallback_cps

# Required sample text from specification:
sample_text = "今日は何曜日ですか？ の ひらがな カタカナ 日本語"
missing_sample = []
for ch in sample_text:
    cp = ord(ch)
    if cp not in total_cps:
        missing_sample.append(f"'{ch}' (U+{cp:04X})")

assert not missing_sample, f"Sample text has missing glyphs: {missing_sample}"

# Standard Hiragana syllabary (U+3041 'ぁ' through U+3093 'ん')
hiragana_missing = [f"U+{cp:04X}" for cp in range(0x3041, 0x3094) if cp not in total_cps]
assert not hiragana_missing, f"Hiragana range incomplete, missing: {hiragana_missing}"

# Standard Katakana syllabary (U+30A1 'ァ' through U+30F6 'ヶ' and prolonger U+30FC 'ー')
katakana_missing = [f"U+{cp:04X}" for cp in list(range(0x30A1, 0x30F7)) + [0x30FC] if cp not in total_cps]
assert not katakana_missing, f"Katakana range incomplete, missing: {katakana_missing}"

# Key conversational Japanese words:
for w in ["今日", "何曜日", "ですか", "の", "ひらがな", "カタカナ", "日本語"]:
    for ch in w:
        assert ord(ch) in total_cps, f"Character '{ch}' in '{w}' not resolved"

print(f"Voice font direct glyphs: {len(voice_cps)}")
print(f"Fallback font glyphs: {len(fallback_cps)}")
print(f"Combined reachable glyphs: {len(total_cps)}")
print(f"Sample '{sample_text}': 100% resolved")
PY

echo "run_voice_font_coverage_test: PASS"
