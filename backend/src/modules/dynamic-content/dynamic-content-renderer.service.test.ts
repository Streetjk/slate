import { describe, expect, it } from 'bun:test';
import { FRAME_BYTES } from 'shared';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import type { BlobService } from '../../infra/blob/blob.service';
import type { GroupsService } from '../groups/groups.service';
import type { DynamicFrameRendererService } from './rendering/dynamic-frame-renderer.service';
import type { DynamicAudioService } from './audio/dynamic-audio.service';
import type { DynamicContentRegistry } from './dynamic-content-registry';
import { DynamicContentRendererService } from './dynamic-content-renderer.service';

describe('DynamicContentRendererService queueing', () => {
  it('does not run a scheduled render queued behind a failed force render', async () => {
    const first = deferred<unknown>();
    let fetchCalls = 0;
    const service = createService({
      fetchData: () => {
        fetchCalls++;
        return first.promise;
      },
    });

    const forceRender = service.renderDynamicContent('content-1', { force: true });
    const scheduledRender = service.renderDynamicContent('content-1');

    first.reject(new Error('provider down'));

    await expect(forceRender).rejects.toThrow('provider down');
    await expect(scheduledRender).rejects.toThrow('provider down');
    expect(fetchCalls).toBe(1);
  });

  it('still runs a force render queued behind a failed force render', async () => {
    const first = deferred<unknown>();
    let fetchCalls = 0;
    const service = createService({
      fetchData: () => {
        fetchCalls++;
        if (fetchCalls === 1) return first.promise;
        return Promise.resolve({ tempC: 21 });
      },
    });

    const failedRender = service.renderDynamicContent('content-1', { force: true });
    const forceRender = service.renderDynamicContent('content-1', { force: true });

    first.reject(new Error('provider down'));

    await expect(failedRender).rejects.toThrow('provider down');
    await expect(forceRender).resolves.toMatchObject({
      contentId: 'content-1',
      groupEtag: 'group-etag',
      unchanged: false,
    });
    expect(fetchCalls).toBe(2);
  });

  it('rejects non-object render data instead of silently rendering empty fields', async () => {
    const service = createService({ fetchData: () => Promise.resolve(['not', 'an', 'object']) });

    await expect(service.renderDynamicContent('content-1', { force: true })).rejects.toThrow(
      'Dynamic data must be a JSON object or null'
    );
  });

  it('keeps a successful render response when dynamic audio sync fails', async () => {
    const service = createService({
      fetchData: () => Promise.resolve({ tempC: 21 }),
      syncAudio: async () => {
        throw new Error('audio cleanup failed');
      },
    });

    await expect(service.renderDynamicContent('content-1', { force: true })).resolves.toMatchObject(
      {
        contentId: 'content-1',
        imageEtag: expect.any(String),
        audioEtag: null,
        groupEtag: 'group-etag',
        unchanged: false,
      }
    );
  });

  it('does not reuse stale time-sensitive dynamic data after fetch failure', async () => {
    const service = createService({
      fetchData: () => Promise.reject(new Error('provider down')),
      imageSize: FRAME_BYTES,
      dynamicData: {
        tempC: 21,
        summary: '晴',
        updatedAt: '2026-05-17T00:00:00.000Z',
      },
      dynamicLastRunAt: new Date('2026-05-17T00:00:00.000Z'),
    });

    await expect(
      service.renderDynamicContent('content-1', {
        force: true,
        now: new Date('2026-05-18T00:00:00.000Z'),
      })
    ).rejects.toThrow('provider down');
  });

  it('reuses fresh time-sensitive dynamic data after fetch failure', async () => {
    const service = createService({
      fetchData: () => Promise.reject(new Error('provider down')),
      imageSize: FRAME_BYTES,
      dynamicData: {
        tempC: 21,
        summary: '晴',
        updatedAt: '2026-05-17T04:00:00.000Z',
      },
      dynamicLastRunAt: new Date('2026-05-17T04:00:00.000Z'),
    });

    await expect(
      service.renderDynamicContent('content-1', {
        force: true,
        now: new Date('2026-05-17T04:10:00.000Z'),
      })
    ).resolves.toMatchObject({
      contentId: 'content-1',
      groupEtag: 'group-etag',
    });
  });

  it('returns the current DB audio etag when audio sync fails after changing audio state', async () => {
    const service = createService({
      fetchData: () => Promise.resolve({ tempC: 21 }),
      audioEtag: 'old-audio',
      currentAudioEtag: null,
      syncAudio: async () => {
        throw new Error('audio cleanup failed');
      },
    });

    await expect(service.renderDynamicContent('content-1', { force: true })).resolves.toMatchObject(
      {
        audioEtag: null,
      }
    );
  });

  it('fails with Unknown dynamic type when dynamic type is not registered', async () => {
    const service = createService({
      dynamicType: 'unregistered_type',
      fetchData: () => Promise.resolve({}),
      registryGet: () => undefined,
    });

    await expect(service.renderDynamicContent('content-1', { force: true })).rejects.toThrow(
      'Unknown dynamic type: unregistered_type'
    );
  });

  it('dispatches google_news to registered provider and renders frame successfully', async () => {
    let renderedType = '';
    const service = createService({
      dynamicType: 'google_news',
      dynamicConfig: { type: 'google_news', edition: 'both' },
      fetchData: () =>
        Promise.resolve({
          edition: 'both',
          updatedAt: '2026-09-01T13:00:00Z',
          sections: [{ edition: 'au', label: 'AU', items: [] }],
        }),
      frameRender: async (ctx) => {
        renderedType = ctx.type;
        return Buffer.alloc(FRAME_BYTES, 0xff);
      },
    });

    await expect(service.renderDynamicContent('content-1', { force: true })).resolves.toMatchObject(
      {
        contentId: 'content-1',
        unchanged: false,
      }
    );
    expect(renderedType).toBe('google_news');
  });

  it('marks error and throws Invalid configuration when weather config is malformed', async () => {
    let markedMessage = '';
    const service = createService({
      dynamicType: 'weather',
      dynamicConfig: { type: 'weather', provider: 'invalid_provider' },
      validateConfig: () => {
        throw new Error('Invalid provider: Invalid enum value');
      },
      updateContent: async (_id, data) => {
        markedMessage = String(data.dynamicLastError ?? '');
      },
      fetchData: () => Promise.resolve({}),
    });

    await expect(service.renderDynamicContent('content-1', { force: true })).rejects.toThrow(
      'Dynamic configuration is invalid: Invalid provider: Invalid enum value'
    );
    expect(markedMessage).toContain('Invalid configuration: Invalid provider: Invalid enum value');
  });
});

function createService(opts: {
  fetchData: () => Promise<unknown>;
  syncAudio?: () => Promise<boolean>;
  audioEtag?: string | null;
  currentAudioEtag?: string | null;
  dynamicData?: unknown;
  dynamicLastRunAt?: Date | null;
  imageSize?: number;
  dynamicType?: string;
  dynamicConfig?: unknown;
  validateConfig?: (raw: unknown) => unknown;
  registryGet?: (type: string) => unknown;
  frameRender?: (ctx: { type: string }) => Promise<Buffer>;
  updateContent?: (id: string, data: Record<string, unknown>) => Promise<unknown>;
}): DynamicContentRendererService {
  const content = {
    id: 'content-1',
    groupId: 'group-1',
    frameName: null,
    kind: 'dynamic',
    dynamicType: opts.dynamicType ?? 'weather',
    dynamicConfig: opts.dynamicConfig ?? {},
    dynamicData: opts.dynamicData ?? null,
    dynamicLastRunAt: opts.dynamicLastRunAt ?? null,
    dynamicNextRunAt: null,
    dynamicLastError: null,
    audioEtag: opts.audioEtag ?? null,
    imageEtag: 'old-image-etag',
    imageSize: opts.imageSize ?? 0,
  };
  const prisma = {
    content: {
      findUnique: async (args?: { select?: { audioEtag?: boolean } }) => {
        if (
          args?.select?.audioEtag &&
          Object.keys(args.select as Record<string, unknown>).length === 1
        ) {
          return {
            audioEtag: 'currentAudioEtag' in opts ? opts.currentAudioEtag! : content.audioEtag,
          };
        }
        return content;
      },
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        if (opts.updateContent) await opts.updateContent(args.where.id, args.data);
        return content;
      },
    },
  };
  const blob = {
    read: async () => null,
    write: async () => undefined,
    delete: async () => undefined,
  };
  const registry = {
    get:
      (opts.registryGet as unknown as (type: string) => unknown) ??
      ((t: string) => ({
        type: t,
        definition: { default_ttl_sec: 300 },
        provider: {
          type: t,
          validateConfig: opts.validateConfig ?? ((raw) => raw),
          fetchData: opts.fetchData,
        },
      })),
    defaultTtlSec: () => 300,
  };
  const frameRenderer = {
    render: opts.frameRender ?? (async () => Buffer.alloc(FRAME_BYTES, 0xff)),
  };
  const groups = {
    recomputeGroupEtags: async () => ({
      structureEtag: 'structure-etag',
      manifestEtag: 'group-etag',
      contentEtags: [{ id: 'content-1', etag: 'content-etag', previousEtag: 'old-content-etag' }],
    }),
  };
  const dynamicAudio = {
    sync: opts.syncAudio ?? (async () => false),
  };
  return new DynamicContentRendererService(
    prisma as unknown as PrismaService,
    blob as unknown as BlobService,
    registry as unknown as DynamicContentRegistry,
    frameRenderer as unknown as DynamicFrameRendererService,
    groups as unknown as GroupsService,
    dynamicAudio as unknown as DynamicAudioService
  );
}

function deferred<T>(): {
  promise: Promise<T>;
  reject: (err: Error) => void;
} {
  let reject!: (err: Error) => void;
  const promise = new Promise<T>((_, rejectFn) => {
    reject = rejectFn;
  });
  return { promise, reject };
}
