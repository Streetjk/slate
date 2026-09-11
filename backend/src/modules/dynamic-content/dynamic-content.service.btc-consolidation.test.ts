import { describe, expect, it } from 'bun:test';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import type { BlobService } from '../../infra/blob/blob.service';
import { DynamicContentService } from './dynamic-content.service';

describe('DynamicContentService BTC weekly consolidation', () => {
  function createService(existing: unknown[], deletedIds: string[] = []) {
    let compactDbWriteCalls = 0;
    const tx = {
      $queryRaw: async () => [{ id: 'group-1' }],
      $executeRaw: async () => {
        compactDbWriteCalls += 1;
        return undefined;
      },
      content: {
        deleteMany: async ({ where }: { where: { id: { in: string[] } } }) => {
          deletedIds.push(...where.id.in);
          return { count: where.id.in.length };
        },
        findMany: async () => existing,
        findUnique: async ({ where }: { where: { id: string } }) =>
          existing.find((record) => record.id === where.id) ?? null,
      },
    };
    const prisma = {
      group: {
        findUnique: async () => ({ manifestEtag: 'group-etag' }),
      },
      content: {
        findMany: async () => existing,
      },
      $transaction: async (operation: (client: unknown) => Promise<unknown>) => operation(tx),
    };
    const groups = {
      assertOwned: async () => undefined,
      recomputeManifestEtag: async () => 'current-group-etag',
    };
    const blob = {
      delete: async () => undefined,
    };
    const service = new DynamicContentService(
      prisma as unknown as PrismaService,
      blob as unknown as BlobService,
      groups as never,
      {} as never,
      {} as never
    );
    let appendCalls = 0;
    (service as { append: unknown }).append = async () => {
      appendCalls++;
      return {
        id: 'created-weekly',
        seq: 0,
        content_etag: 'content-etag',
        image_etag: 'image-etag',
        audio_etag: null,
        manifest_etag: 'group-etag',
      };
    };
    return {
      service,
      getAppendCalls: () => appendCalls,
      getCompactDbWriteCalls: () => compactDbWriteCalls,
    };
  }

  it('consolidates only BTC records around the first valid weekly tile', async () => {
    const deletedIds: string[] = [];
    const { service, getAppendCalls, getCompactDbWriteCalls } = createService(
      [
        {
          id: 'daily',
          sortOrder: 0,
          contentEtag: 'daily',
          imageEtag: 'daily',
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'daily' },
        },
        {
          id: 'weekly',
          sortOrder: 1,
          contentEtag: 'weekly',
          imageEtag: 'weekly',
          audioEtag: 'audio',
          dynamicConfig: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
        },
        {
          id: 'monthly',
          sortOrder: 2,
          contentEtag: 'monthly',
          imageEtag: 'monthly',
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'monthly' },
        },
        {
          id: 'duplicate',
          sortOrder: 3,
          contentEtag: 'dup',
          imageEtag: 'dup',
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'weekly' },
        },
        {
          id: 'weather',
          sortOrder: 4,
          contentEtag: 'weather',
          imageEtag: 'weather',
          audioEtag: null,
          dynamicConfig: { type: 'weather' },
        },
      ],
      deletedIds
    );

    const response = await service.appendBtcTrio('group-1', 'user-1');

    expect(deletedIds).toEqual(['daily', 'monthly', 'duplicate']);
    expect(getCompactDbWriteCalls()).toBe(2);
    expect(getAppendCalls()).toBe(0);
    expect(response).toEqual([
      {
        id: 'weekly',
        seq: 1,
        content_etag: 'weekly',
        image_etag: 'weekly',
        audio_etag: 'audio',
        manifest_etag: 'current-group-etag',
      },
    ]);
  });

  it('is idempotent when only the weekly BTC tile exists', async () => {
    const deletedIds: string[] = [];
    const { service, getAppendCalls } = createService(
      [
        {
          id: 'weekly',
          sortOrder: 0,
          contentEtag: 'weekly',
          imageEtag: 'weekly',
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'weekly' },
        },
      ],
      deletedIds
    );

    await service.appendBtcTrio('group-1', 'user-1');
    await service.appendBtcTrio('group-1', 'user-1');

    expect(deletedIds).toEqual([]);
    expect(getAppendCalls()).toBe(0);
  });

  it('returns the kept weekly response after compaction reorders it', async () => {
    const kept = {
      id: 'weekly',
      sortOrder: 2,
      contentEtag: 'weekly',
      imageEtag: 'weekly',
      audioEtag: null,
      dynamicConfig: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
    };
    const { service, getAppendCalls } = createService([
      {
        id: 'daily',
        sortOrder: 0,
        contentEtag: 'daily',
        imageEtag: 'daily',
        audioEtag: null,
        dynamicConfig: { type: 'btc_price', period: 'daily' },
      },
      kept,
      {
        id: 'monthly',
        sortOrder: 3,
        contentEtag: 'monthly',
        imageEtag: 'monthly',
        audioEtag: null,
        dynamicConfig: { type: 'btc_price', period: 'monthly' },
      },
    ]);
    // Compaction removes the deleted gap and shifts the kept tile forward.
    (kept as { sortOrder: number }).sortOrder = 1;

    const response = await service.appendBtcTrio('group-1', 'user-1');

    expect(response).toEqual([
      {
        id: 'weekly',
        seq: 1,
        content_etag: 'weekly',
        image_etag: 'weekly',
        audio_etag: null,
        manifest_etag: 'current-group-etag',
      },
    ]);
    expect(getAppendCalls()).toBe(0);
  });
});
