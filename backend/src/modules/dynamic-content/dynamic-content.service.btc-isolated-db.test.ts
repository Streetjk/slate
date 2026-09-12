import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'bun:test';
import { DynamicContentService } from './dynamic-content.service';
import { computeETag } from '../../common/utils/etag';

const databaseUrl = process.env.M04_ISOLATED_DATABASE_URL;
const runIsolated = databaseUrl ? it : it.skip;

describe('DynamicContentService BTC isolated database qualification', () => {
  function makeService(prisma: PrismaClient, shouldFailRender = false): DynamicContentService {
    const groups = {
      assertOwned: async () => undefined,
      recomputeManifestEtag: async (groupId: string, tx: typeof prisma) => {
        await tx.group.update({ where: { id: groupId }, data: { manifestEtag: 'm04-recomputed' } });
        return 'm04-recomputed';
      },
    };
    const renderer = {
      renderDynamicContent: async (contentId: string) => {
        if (shouldFailRender) throw new Error('isolated-render-failure');
        await prisma.content.update({
          where: { id: contentId },
          data: {
            imageEtag: 'm04-rendered-image',
            imageSize: 128,
            dynamicRefreshLeaseUntil: null,
          },
        });
        return {
          contentId,
          imageEtag: 'm04-rendered-image',
          contentEtag: 'm04-rendered-content',
          audioEtag: null,
          groupEtag: 'm04-recomputed',
          renderedAt: new Date(),
          unchanged: false,
        };
      },
    };
    const blob = { delete: async () => undefined };
    return new DynamicContentService(
      prisma as never,
      blob as never,
      groups as never,
      {} as never,
      renderer as never
    );
  }

  async function reset(prisma: PrismaClient): Promise<void> {
    await prisma.content.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: { id: 'm04-user', email: 'm04@example.invalid', password: 'synthetic-test-only' },
    });
    await prisma.group.create({
      data: { id: 'm04-group', name: 'M04 isolated', ownerUserId: 'm04-user', sortOrder: 0 },
    });
  }

  async function seedBtc(
    prisma: PrismaClient,
    rows: Array<{ id: string; period: string; sortOrder: number }>
  ): Promise<void> {
    for (const row of rows) {
      await prisma.content.create({
        data: {
          id: row.id,
          groupId: 'm04-group',
          sortOrder: row.sortOrder,
          frameName: `BTC ${row.period}`,
          imageEtag: `seed-${row.id}`,
          imageSize: 128,
          kind: 'dynamic',
          dynamicType: 'btc_price',
          dynamicConfig: { type: 'btc_price', period: row.period, refresh_interval_sec: 600 },
          dynamicNextRunAt: new Date(0),
          dynamicRefreshDueAt: new Date(0),
        },
      });
    }
  }

  runIsolated('serializes two service instances against the real group row lock', async () => {
    const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl!) });
    try {
      await reset(prisma);
      await seedBtc(prisma, [
        { id: 'm04-daily', period: 'daily', sortOrder: 0 },
        { id: 'm04-monthly', period: 'monthly', sortOrder: 1 },
      ]);
      const first = makeService(prisma);
      const second = makeService(prisma);
      const results = await Promise.all([
        first.appendBtcTrio('m04-group', 'm04-user'),
        second.appendBtcTrio('m04-group', 'm04-user'),
      ]);
      const rows = await prisma.content.findMany({
        where: { groupId: 'm04-group', dynamicType: 'btc_price' },
        orderBy: { sortOrder: 'asc' },
      });
      expect(results[0][0].id).toBe(results[1][0].id);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.dynamicConfig).toMatchObject({ period: 'weekly' });
      expect(rows[0]?.imageSize).toBe(128);
    } finally {
      await prisma.$disconnect();
    }
  });

  runIsolated('rolls back a failed replacement without deleting legacy records', async () => {
    const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl!) });
    try {
      await reset(prisma);
      await seedBtc(prisma, [{ id: 'm04-daily', period: 'daily', sortOrder: 0 }]);
      const service = makeService(prisma, true);
      await expect(service.appendBtcTrio('m04-group', 'm04-user')).rejects.toThrow(
        'isolated-render-failure'
      );
      const rows = await prisma.content.findMany({
        where: { groupId: 'm04-group', dynamicType: 'btc_price' },
        orderBy: { sortOrder: 'asc' },
      });
      expect(rows.map((row) => row.id)).toEqual(['m04-daily']);
    } finally {
      await prisma.$disconnect();
    }
  });

  runIsolated('keeps a valid weekly record and removes only legacy BTC records', async () => {
    const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl!) });
    try {
      await reset(prisma);
      await seedBtc(prisma, [
        { id: 'm04-daily', period: 'daily', sortOrder: 0 },
        { id: 'm04-weekly', period: 'weekly', sortOrder: 1 },
        { id: 'm04-monthly', period: 'monthly', sortOrder: 2 },
      ]);
      const service = makeService(prisma);
      const [response] = await service.appendBtcTrio('m04-group', 'm04-user');
      const rows = await prisma.content.findMany({
        where: { groupId: 'm04-group', dynamicType: 'btc_price' },
      });
      expect(response?.id).toBe('m04-weekly');
      expect(rows.map((row) => row.id)).toEqual(['m04-weekly']);
    } finally {
      await prisma.$disconnect();
    }
  });

  runIsolated('resumes after an expired interrupted weekly placeholder', async () => {
    const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl!) });
    try {
      await reset(prisma);
      const staleId = 'm04-stale-placeholder';
      await prisma.content.create({
        data: {
          id: staleId,
          groupId: 'm04-group',
          sortOrder: 0,
          frameName: 'BTC/USD · Weekly',
          imageEtag: computeETag(`btc-provisioning:${staleId}`),
          imageSize: 0,
          kind: 'dynamic',
          dynamicType: 'btc_price',
          dynamicConfig: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
          dynamicNextRunAt: new Date(0),
          dynamicRefreshDueAt: new Date(0),
          dynamicRefreshLeaseUntil: new Date(Date.now() - 1),
        },
      });

      const [response] = await makeService(prisma).appendBtcTrio('m04-group', 'm04-user');
      const rows = await prisma.content.findMany({
        where: { groupId: 'm04-group', dynamicType: 'btc_price' },
      });

      expect(response?.id).not.toBe(staleId);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.dynamicConfig).toMatchObject({ period: 'weekly' });
      expect(rows[0]?.imageSize).toBe(128);
    } finally {
      await prisma.$disconnect();
    }
  });
});
