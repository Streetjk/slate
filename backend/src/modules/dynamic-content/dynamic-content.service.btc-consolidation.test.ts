import { describe, expect, it } from 'bun:test';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import type { BlobService } from '../../infra/blob/blob.service';
import { DynamicContentService } from './dynamic-content.service';
import { computeETag } from '../../common/utils/etag';

describe('DynamicContentService BTC weekly consolidation', () => {
  function createService(
    existing: unknown[],
    deletedIds: string[] = [],
    render: 'pass' | 'fail' = 'pass'
  ) {
    const records = existing as Array<Record<string, unknown>>;
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
          for (const id of where.id.in) {
            const index = records.findIndex((record) => record.id === id);
            if (index >= 0) records.splice(index, 1);
          }
          return { count: where.id.in.length };
        },
        delete: async ({ where }: { where: { id: string } }) => {
          const index = records.findIndex((record) => record.id === where.id);
          if (index >= 0) records.splice(index, 1);
          return { id: where.id };
        },
        findMany: async () => records,
        findFirst: async () => {
          const sortOrders = records
            .map((record) => record.sortOrder)
            .filter((sortOrder): sortOrder is number => typeof sortOrder === 'number');
          return sortOrders.length === 0 ? null : { sortOrder: Math.max(...sortOrders) };
        },
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const record = {
            ...data,
            contentEtag: 'created-content',
            audioEtag: null,
            imageSize: data.imageSize ?? 0,
            dynamicRefreshLeaseUntil: data.dynamicRefreshLeaseUntil ?? null,
          };
          records.push(record);
          return record;
        },
        findUnique: async ({ where }: { where: { id: string } }) =>
          records.find((record) => record.id === where.id) ?? null,
      },
    };
    const prisma = {
      group: {
        findUnique: async () => ({ manifestEtag: 'group-etag' }),
      },
      content: {
        findMany: async () => records,
        findUnique: async ({ where }: { where: { id: string } }) =>
          records.find((record) => record.id === where.id) ?? null,
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
    const renderer = {
      renderDynamicContent: async (contentId: string) => {
        if (render === 'fail') throw new Error('render fixture failure');
        const record = records.find((candidate) => candidate.id === contentId);
        if (record) {
          record.imageEtag = 'rendered-image';
          record.imageSize = 128;
          record.dynamicRefreshLeaseUntil = null;
        }
        return {
          contentId,
          imageEtag: 'rendered-image',
          contentEtag: 'rendered-content',
          audioEtag: null,
          groupEtag: 'rendered-group',
          renderedAt: new Date(),
          unchanged: false,
        };
      },
    };
    const service = new DynamicContentService(
      prisma as unknown as PrismaService,
      blob as unknown as BlobService,
      groups as never,
      {} as never,
      renderer as never
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
      getRecords: () => records,
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

  it('serializes concurrent provisioning and renders before legacy cleanup', async () => {
    const deletedIds: string[] = [];
    const { service, getRecords } = createService(
      [
        {
          id: 'daily',
          sortOrder: 0,
          contentEtag: 'daily',
          imageEtag: 'daily',
          imageSize: 128,
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'daily' },
          dynamicRefreshLeaseUntil: null,
        },
        {
          id: 'monthly',
          sortOrder: 1,
          contentEtag: 'monthly',
          imageEtag: 'monthly',
          imageSize: 128,
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'monthly' },
          dynamicRefreshLeaseUntil: null,
        },
      ],
      deletedIds
    );

    const results = await Promise.all([
      service.appendBtcTrio('group-1', 'user-1'),
      service.appendBtcTrio('group-1', 'user-1'),
    ]);

    expect(results).toHaveLength(2);
    expect(results[0][0].id).toBe(results[1][0].id);
    expect(deletedIds).toEqual(['daily', 'monthly']);
    expect(getRecords()).toHaveLength(1);
    expect(getRecords()[0].dynamicConfig).toMatchObject({ period: 'weekly' });
  });

  it('rolls back the weekly placeholder when rendering fails and preserves legacy records', async () => {
    const deletedIds: string[] = [];
    const { service, getRecords } = createService(
      [
        {
          id: 'daily',
          sortOrder: 0,
          contentEtag: 'daily',
          imageEtag: 'daily',
          imageSize: 128,
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'daily' },
          dynamicRefreshLeaseUntil: null,
        },
      ],
      deletedIds,
      'fail'
    );

    await expect(service.appendBtcTrio('group-1', 'user-1')).rejects.toThrow(
      'render fixture failure'
    );
    expect(getRecords().map((record) => record.id)).toEqual(['daily']);
    expect(deletedIds).toEqual([]);
  });

  it('replaces an expired interrupted placeholder before consolidating', async () => {
    const deletedIds: string[] = [];
    const staleId = 'stale-placeholder';
    const { service, getRecords } = createService(
      [
        {
          id: staleId,
          sortOrder: 0,
          contentEtag: 'stale-content',
          imageEtag: computeETag(`btc-provisioning:${staleId}`),
          imageSize: 0,
          audioEtag: null,
          dynamicConfig: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
          dynamicRefreshLeaseUntil: new Date(Date.now() - 1),
        },
      ],
      deletedIds
    );

    const [response] = await service.appendBtcTrio('group-1', 'user-1');

    expect(response?.id).not.toBe(staleId);
    expect(deletedIds).toContain(staleId);
    expect(getRecords()).toHaveLength(1);
    expect(getRecords()[0]?.dynamicConfig).toMatchObject({ period: 'weekly' });
    expect(getRecords()[0]?.imageSize).toBe(128);
  });
});
