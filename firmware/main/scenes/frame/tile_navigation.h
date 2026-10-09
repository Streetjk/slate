#pragma once

namespace tile_navigation {
// is_picture returns false for unknown/missing metadata so it stays reachable.
template <typename IsPicture>
int FindNextTile(int current, int count, int direction, IsPicture is_picture) {
    if (count <= 0 || current < 0 || current >= count ||
        (direction != 1 && direction != -1)) return current;
    int gallery = -1;
    for (int i = 0; i < count; ++i) {
        if (is_picture(i)) { gallery = i; break; }
    }
    const int anchor = is_picture(current) ? gallery : current;
    for (int step = 1; step <= count; ++step) {
        const int candidate = (anchor + direction * step + count) % count;
        if (!is_picture(candidate) || candidate == gallery) return candidate == anchor ? current : candidate;
    }
    return current;
}
}  // namespace tile_navigation
