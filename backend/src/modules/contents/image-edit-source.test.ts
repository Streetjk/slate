import { describe, expect, it } from 'bun:test';
import sharp from 'sharp';
import { FRAME_BYTES } from 'shared';
import { ContentsService } from './contents.service';
import { ContentsReadService } from './contents-read.service';
import { encodeImageSource, decodeImageSource } from './image-edit-source';
import { ImageRendererService } from '../image-renderer/image-renderer.service';

const upload = {
  hasImage: true,
  imageBuf: Buffer.from('original-gray'),
  imageMime: 'image/png',
  hasAudio: false,
  audioBuf: null,
  hasFrameName: false,
  frameName: null,
  mode: 'floyd' as const,
  threshold: 128,
};
function fixture(options: { missing?: boolean; denied?: boolean; failUpdate?: boolean } = {}) {
  const original = encodeImageSource(upload);
  const blobs = new Map<string, Buffer>([['image', Buffer.from('old-frame')]]);
  if (!options.missing) blobs.set('image-source', original);
  const row = {
    id: 'photo',
    groupId: 'group',
    kind: 'image',
    sortOrder: 0,
    imageEtag: 'old-frame',
    audioEtag: 'keep-audio',
    audioSource: 'upload',
  };
  let updateData: Record<string, unknown> = {};
  let renderOptions: Record<string, unknown> = {};
  const tx = {
    $queryRaw: async () => [{ id: 'group' }],
    content: {
      findUnique: async () => row,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        if (options.failUpdate) throw new Error('db failed');
        updateData = data;
        return { imageEtag: 'new-frame', audioEtag: 'keep-audio', contentEtag: 'content-etag' };
      },
    },
  };
  const prisma = {
    content: { findUnique: async () => row },
    group: { findUnique: async () => ({ ownerUserId: 'owner' }) },
    $transaction: async (fn: (tx: unknown) => unknown) => fn(tx),
  };
  const blob = {
    read: async (_gid: string, _id: string, kind: string) => blobs.get(kind) ?? null,
    write: async (_gid: string, _id: string, kind: string, data: Buffer) => {
      blobs.set(kind, data);
    },
    delete: async (_gid: string, _id: string, kind: string) => {
      blobs.delete(kind);
    },
  };
  const groups = {
    assertOwned: async () => {
      if (options.denied) throw new Error('not owned');
    },
    recomputeManifestEtag: async () => 'group-etag',
  };
  const renderer = {
    renderTo1bpp: async (bytes: Buffer, opts: Record<string, unknown>) => {
      expect(bytes).toEqual(upload.imageBuf!);
      renderOptions = opts;
      return { data: Buffer.from('new-frame') };
    },
    validateFrameSize: () => undefined,
  };
  const service = new ContentsService(
    prisma as never,
    blob as never,
    groups as never,
    renderer as never,
    {} as never,
    {} as never,
    {
      delete: async () => {
        throw new Error('Audio must be preserved');
      },
    } as never
  );
  const reads = new ContentsReadService(
    prisma as never,
    blob as never,
    groups as never,
    {} as never,
    {} as never
  );
  return {
    service,
    reads,
    blobs,
    original,
    data: () => updateData,
    renderOptions: () => renderOptions,
  };
}
const modePatch = {
  hasImage: false,
  imageBuf: null,
  hasAudio: false,
  audioBuf: null,
  hasFrameName: false,
  frameName: null,
  mode: 'threshold' as const,
  threshold: 190,
};

describe('photo dithering source', () => {
  it('round-trips undithered source and settings', () => {
    const source = decodeImageSource(encodeImageSource(upload));
    expect(Buffer.from(source.image_base64, 'base64')).toEqual(upload.imageBuf!);
    expect(source.mode).toBe('floyd');
    expect(source.threshold).toBe(128);
  });
  it('rerenders from retained source, persists settings and preserves audio', async () => {
    const f = fixture();
    await f.service.patchImage('photo', 'owner', modePatch);
    expect(f.renderOptions().mode).toBe('threshold');
    expect(f.renderOptions().threshold).toBe(190);
    expect(f.data()).not.toHaveProperty('audioEtag');
    expect(decodeImageSource(f.blobs.get('image-source')!).mode).toBe('threshold');
  });
  it('rejects legacy algorithm-only edits without altering the saved frame', async () => {
    const f = fixture({ missing: true });
    await expect(f.service.patchImage('photo', 'owner', modePatch)).rejects.toThrow(
      'Upload the original'
    );
    expect(f.blobs.get('image')).toEqual(Buffer.from('old-frame'));
    expect(await f.reads.readImageSource('photo', 'owner')).toBeNull();
  });
  it('checks ownership before reading or changing a retained source', async () => {
    const f = fixture({ denied: true });
    await expect(f.service.patchImage('photo', 'other', modePatch)).rejects.toThrow('not owned');
    await expect(f.reads.readImageSource('photo', 'other')).rejects.toThrow();
    expect(f.blobs.get('image-source')).toEqual(f.original);
  });
  it('rolls back both frame and source when the database mutation fails', async () => {
    const f = fixture({ failUpdate: true });
    await expect(f.service.patchImage('photo', 'owner', modePatch)).rejects.toThrow('db failed');
    expect(f.blobs.get('image')).toEqual(Buffer.from('old-frame'));
    expect(f.blobs.get('image-source')).toEqual(f.original);
  });
  it('produces different real output for different algorithms from the same gray source', async () => {
    const raw = Buffer.alloc(400 * 300);
    for (let y = 0; y < 300; y++)
      for (let x = 0; x < 400; x++) raw[y * 400 + x] = Math.floor((x * 255) / 399);
    const png = await sharp(raw, { raw: { width: 400, height: 300, channels: 1 } })
      .png()
      .toBuffer();
    const cache = {
      key: () => 'test-key',
      getOrCompute: async (_key: string, compute: () => Promise<Buffer>) => ({
        data: await compute(),
        fromCache: false,
      }),
    };
    const renderer = new ImageRendererService(cache as never);
    const a = await renderer.renderTo1bpp(png, { mode: 'floyd' });
    const b = await renderer.renderTo1bpp(png, { mode: 'threshold', threshold: 190 });
    expect(a.data.length).toBe(FRAME_BYTES);
    expect(b.data.length).toBe(FRAME_BYTES);
    expect(a.data.equals(b.data)).toBe(false);
  });
});
