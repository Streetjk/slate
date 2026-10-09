#include <cassert>
#include <vector>
#include "../firmware/main/scenes/frame/tile_navigation.h"
#include "../firmware/main/drivers/input/wake_button_filter.h"

int main() {
    // Dynamic A, first photo, dynamic B, photo 2, photo 3, dynamic C.
    std::vector<bool> photos{false, true, false, true, true, false};
    auto next = [&](int i, int direction) {
        return tile_navigation::FindNextTile(i, static_cast<int>(photos.size()), direction,
                                           [&](int n) { return photos[n]; });
    };
    assert(next(0, 1) == 1);
    assert(next(1, 1) == 2);
    assert(next(3, 1) == 2);
    assert(next(4, 1) == 2);
    assert(next(2, 1) == 5);
    assert(next(5, 1) == 0);
    assert(next(3, -1) == 0);
    assert(next(5, -1) == 2);
    // Only a gallery: ENTER must not change the selected photo.
    photos = {true, true, true};
    assert(next(2, 1) == 2);
    assert(next(1, -1) == 1);
    photos = {false};
    assert(next(0, 1) == 0);
    photos = {false, false, false}; // Missing metadata remains reachable.
    assert(next(0, 1) == 1);
    assert(next(0, -1) == 2);
    photos.clear();
    assert(next(0, 1) == 0);

    WakeButtonFilter wake(true);
    for (int i = 0; i < 2000; ++i) assert(!wake.Read(true)); // Held wake press.
    assert(!wake.Read(false)); // One release sample/bounce must not arm navigation.
    assert(!wake.Read(true));
    assert(!wake.Read(false));
    assert(!wake.Read(false)); // Debounced release is invisible to recognizer.
    assert(wake.Read(true)); // Next press is a normal gesture.
    assert(!wake.Read(false));
    assert(wake.Read(true));
    WakeButtonFilter released_before_init(true);
    assert(!released_before_init.Read(false));
    assert(!released_before_init.Read(false));
    assert(released_before_init.Read(true));
    WakeButtonFilter cold(false);
    assert(cold.Read(true));
    assert(!cold.Read(false));
}
