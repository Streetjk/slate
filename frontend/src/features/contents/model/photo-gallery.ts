type GalleryItem = { id: string; kind: string; seq: number };

export function galleryTiles<T extends GalleryItem>(contents: readonly T[]): T[] {
  let seenPhoto = false;
  return [...contents]
    .sort((a, b) => a.seq - b.seq)
    .filter((item) => {
      if (item.kind !== 'image') return true;
      if (seenPhoto) return false;
      seenPhoto = true;
      return true;
    });
}

export function expandGalleryOrder(
  contents: readonly GalleryItem[],
  tileOrder: readonly string[]
): string[] {
  const photos = [...contents]
    .sort((a, b) => a.seq - b.seq)
    .filter((item) => item.kind === 'image');
  return tileOrder.flatMap((id) => (id === photos[0]?.id ? photos.map((photo) => photo.id) : [id]));
}
