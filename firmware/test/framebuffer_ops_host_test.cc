#include <cassert>

#include "drivers/display/framebuffer_ops.h"

int main() {
    epd::Rect window;

    assert(epd::MakePartialWindow({14, 46, 4, 22}, 400, 300, window));
    assert(window.x == 8 && window.y == 46 && window.w == 16 && window.h == 22);

    assert(epd::MakePartialWindow({399, 299, 1, 1}, 400, 300, window));
    assert(window.x == 392 && window.y == 299 && window.w == 8 && window.h == 1);

    assert(epd::MakePartialWindow({-3, 5, 10, 4}, 400, 300, window));
    assert(window.x == 0 && window.y == 5 && window.w == 8 && window.h == 4);

    assert(!epd::MakePartialWindow({}, 400, 300, window));
    assert(!epd::MakePartialWindow({500, 5, 8, 8}, 400, 300, window));
    assert(!epd::MakePartialWindow({0, 0, 8, 8}, 0, 300, window));

    uint8_t out0 = 0;
    uint8_t out1 = 0;
    epd::PackPartial1bppTo2683(0xFF, 0x00, out0, out1);
    assert(out0 == 0xAA && out1 == 0xAA);
    epd::PackPartial1bppTo2683(0x00, 0xFF, out0, out1);
    assert(out0 == 0x55 && out1 == 0x55);
    return 0;
}
