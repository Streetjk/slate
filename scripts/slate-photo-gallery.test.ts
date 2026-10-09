import { expect, test } from 'bun:test';
import {
  expandGalleryOrder,
  galleryTiles,
} from '../frontend/src/features/contents/model/photo-gallery';

const items = [
  { id: 'a', kind: 'dynamic', seq: 0 },
  { id: 'p1', kind: 'image', seq: 1 },
  { id: 'b', kind: 'dynamic', seq: 2 },
  { id: 'p2', kind: 'image', seq: 3 },
  { id: 'p3', kind: 'image', seq: 4 },
  { id: 'c', kind: 'dynamic', seq: 5 },
];
test('one gallery tile even with nonadjacent pictures', () => {
  expect(galleryTiles([...items].reverse()).map((i) => i.id)).toEqual(['a', 'p1', 'b', 'c']);
});
test('moving gallery preserves every picture exactly once in photo order', () => {
  expect(expandGalleryOrder(items, ['c', 'a', 'b', 'p1'])).toEqual([
    'c',
    'a',
    'b',
    'p1',
    'p2',
    'p3',
  ]);
});
test('deleting the first photo promotes the next picture', () => {
  const remaining = items.filter((i) => i.id !== 'p1');
  expect(galleryTiles(remaining).map((i) => i.id)).toEqual(['a', 'b', 'p2', 'c']);
  expect(expandGalleryOrder(remaining, ['p2', 'a', 'b', 'c'])).toEqual(['p2', 'p3', 'a', 'b', 'c']);
});
test('empty, photo-only and dynamic-only groups', () => {
  expect(galleryTiles([])).toEqual([]);
  expect(expandGalleryOrder([], [])).toEqual([]);
  expect(galleryTiles(items.filter((i) => i.kind === 'image')).length).toBe(1);
  expect(galleryTiles(items.filter((i) => i.kind === 'dynamic')).length).toBe(3);
});
