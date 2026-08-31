import { createId } from '@paralleldrive/cuid2';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DashboardDataPayload,
  DynamicConfig,
  isAudioDynamicConfig,
  type ContentMutationResponseT,
  type CreateDynamicContentRequestT,
  type IngestPayloadT,
} from 'shared';
import { BlobService } from '../../infra/blob/blob.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { computeETag } from '../../common/utils/etag';
import { ConflictError, InternalError, NotFoundError, ValidationError } from '../../common/errors';
import { toPrismaInputJson } from '../../common/db/prisma-json';
import { lockGroupRow } from '../../common/db/row-locks';
import { compactContentSortOrders } from '../../common/db/bulk-sort-order';
import { nextContentSortOrder } from '../../common/db/sort-order';
import { formatError } from '../../common/utils/error-format';
import { KeyedPromiseQueue } from '../../common/worker/keyed-promise-queue';
import { GroupsService } from '../groups/groups.service';
import { deleteContentAudioBlob } from '../../infra/blob/content-audio-blobs';
import { DynamicContentRegistry } from './dynamic-content-registry';
import { DynamicContentRendererService } from './dynamic-content-renderer.service';
import { defaultDynamicFrameName } from './status-text/dynamic-content-status-text';
import { toContentMutationResponse } from '../contents/content-mutation-response';

const DYNAMIC_MUTATION_TAIL_TTL_MS = 5 * 60_000;

@Injectable()
export class DynamicContentService {
  private readonly logger = new Logger(DynamicContentService.name);
  private readonly mutationQueue = new KeyedPromiseQueue({
    ttlMs: DYNAMIC_MUTATION_TAIL_TTL_MS,
    onPreviousError: (contentId, err) => {
      this.logger.warn(
        `Previous dynamic mutation failed for content ${contentId}: ${formatError(err)}`
      );
    },
    onExpired: (contentId) => {
      this.logger.warn(`Dynamic mutation lock expired for content ${contentId}.`);
    },
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly blob: BlobService,
    private readonly groups: GroupsService,
    private readonly registry: DynamicContentRegistry,
    private readonly renderer: DynamicContentRendererService
  ) {}

  async previewDirect(raw: {
    config: unknown;
    frame_name?: string | null;
    data?: unknown;
  }): Promise<Buffer> {
    const config = DynamicConfig.parse(raw.config);
    const previewData = this.parseDashboardPreviewData(config.type, raw.data);
    return this.renderer.renderPreviewDirect(
      config.type,
      config,
      raw.frame_name ?? defaultDynamicFrameName(config.type, config),
      previewData
    );
  }

  async preview(
    contentId: string,
    ownerUserId: string,
    body: { config: unknown; frame_name?: string | null; data?: unknown }
  ): Promise<Buffer> {
    if (body.data === undefined) {
      return this.renderer.renderPreview(contentId, ownerUserId, body.config, body.frame_name);
    }

    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: {
        kind: true,
        dynamicType: true,
        frameName: true,
        group: { select: { ownerUserId: true } },
      },
    });
    if (!content || content.group.ownerUserId !== ownerUserId)
      throw new NotFoundError('Content not found');
    if (content.kind !== 'dynamic' || !content.dynamicType)
      throw new ValidationError('This content is not dynamic');
    const config = DynamicConfig.parse(body.config);
    if (config.type !== content.dynamicType) {
      throw new ValidationError(
        `dynamic_type does not match config.type: ${content.dynamicType} vs ${config.type}`
      );
    }
    if (config.type !== 'dashboard') {
      throw new ValidationError(
        'Only external-data content supports the data parameter for preview'
      );
    }
    const frameName = body.frame_name === undefined ? content.frameName : body.frame_name;
    const previewData = this.parseDashboardData(
      body.data,
      'Dashboard preview data cannot be empty'
    );
    return this.renderer.renderPreviewDirect(config.type, config, frameName, previewData);
  }

  async append(
    gid: string,
    ownerUserId: string,
    raw: CreateDynamicContentRequestT
  ): Promise<ContentMutationResponseT> {
    await this.groups.assertOwned(gid, ownerUserId);
    const { config, frame_name } = raw;
    const dynamicType = config.type;
    const entry = this.registry.get(dynamicType);
    if (!entry) throw new ValidationError(`Unknown dynamic type: ${dynamicType}`);
    const validatedConfig = DynamicConfig.parse(config);
    if (validatedConfig.type !== dynamicType) {
      throw new ValidationError(
        `dynamic_type does not match config.type: ${dynamicType} vs ${validatedConfig.type}`
      );
    }
    const initialDashboardData =
      validatedConfig.type === 'dashboard'
        ? this.parseDashboardData(raw.initial_data, 'Dashboard initial data cannot be empty')
        : undefined;

    const contentId = createId();
    const placeholderEtag = computeETag(`dynamic-init:${contentId}`);
    const audioEnabled = isAudioDynamicConfig(validatedConfig) && validatedConfig.audio_enabled;
    const audioVoice = isAudioDynamicConfig(validatedConfig) ? validatedConfig.audio_voice : null;
    let created: { seq: number; didCreate: boolean } = { seq: -1, didCreate: false };
    try {
      const seq = await this.prisma.$transaction(async (tx) => {
        await lockGroupRow(tx, gid);
        const nextSeq = await nextContentSortOrder(tx, gid);
        await tx.content.create({
          data: {
            id: contentId,
            groupId: gid,
            sortOrder: nextSeq,
            frameName: frame_name ?? defaultDynamicFrameName(dynamicType, validatedConfig),
            kind: 'dynamic',
            dynamicType,
            dynamicConfig: toPrismaInputJson(validatedConfig),
            ...(initialDashboardData === undefined
              ? {}
              : { dynamicData: toPrismaInputJson(initialDashboardData) }),
            imageEtag: placeholderEtag,
            imageSize: 0,
            audioStatus: audioEnabled ? 'pending' : 'none',
            audioSource: audioEnabled ? 'tts' : null,
            audioVoice: audioEnabled ? audioVoice : null,
            dynamicNextRunAt: new Date(0),
            dynamicRefreshDueAt: new Date(0),
          },
        });
        return nextSeq;
      });
      created = { seq, didCreate: true };
      const rendered = await this.renderDynamicAndReadEtag(contentId);
      return toContentMutationResponse(
        contentId,
        seq,
        rendered.imageEtag,
        null,
        rendered.groupEtag,
        rendered.contentEtag
      );
    } catch (err) {
      if (created.didCreate) await this.rollbackCreation(contentId, gid, err);
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')
        throw new ConflictError('Content sequence number already exists');
      throw err;
    }
  }

  async patch(
    contentId: string,
    ownerUserId: string,
    body: { frame_name?: string | null; config?: unknown }
  ): Promise<ContentMutationResponseT> {
    if (body.frame_name === undefined && body.config === undefined) {
      throw new ValidationError('No fields to update', { code: 'nothing_to_patch' });
    }

    return this.runMutation(contentId, async () => {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
        select: {
          id: true,
          groupId: true,
          sortOrder: true,
          kind: true,
          dynamicType: true,
          dynamicConfig: true,
        },
      });
      if (!content) throw new NotFoundError('Content not found');
      if (content.kind !== 'dynamic' || !content.dynamicType)
        throw new ValidationError('This content is not dynamic');
      await this.groups.assertOwned(content.groupId, ownerUserId);

      const data: Prisma.ContentUpdateInput = {};
      if (body.frame_name !== undefined) data.frameName = body.frame_name;
      if (body.config !== undefined) {
        const validated = DynamicConfig.parse(body.config);
        const currentType = content.dynamicType;
        if (validated.type !== currentType) {
          throw new ValidationError(
            `Cannot change type on existing dynamic content (${currentType} → ${validated.type}); delete and recreate it`
          );
        }
        data.dynamicConfig = toPrismaInputJson(validated);
        data.dynamicRefreshDueAt = new Date();
        data.dynamicRefreshLeaseUntil = null;
        if (body.frame_name === undefined && currentType !== 'dashboard') {
          data.frameName = defaultDynamicFrameName(currentType, validated);
        }
      }
      await this.prisma.content.update({ where: { id: contentId }, data });
      const rendered = await this.renderDynamicAndReadEtag(contentId);
      return toContentMutationResponse(
        contentId,
        content.sortOrder,
        rendered.imageEtag,
        rendered.audioEtag,
        rendered.groupEtag,
        rendered.contentEtag
      );
    });
  }

  async patchFrameNameIfDynamic(
    contentId: string,
    ownerUserId: string,
    frameName: string | null
  ): Promise<ContentMutationResponseT | null> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: {
        groupId: true,
        sortOrder: true,
        kind: true,
        dynamicType: true,
        group: { select: { ownerUserId: true } },
      },
    });
    if (!content) throw new NotFoundError('Content not found');
    if (content.group.ownerUserId !== ownerUserId) throw new NotFoundError('Content not found');
    if (content.kind !== 'dynamic') return null;
    if (!content.dynamicType) throw new ValidationError('This content is not dynamic');

    const rendered = await this.runMutation(contentId, async () => {
      await this.prisma.content.update({ where: { id: contentId }, data: { frameName } });
      return this.renderDynamicAndReadEtag(contentId);
    });
    return toContentMutationResponse(
      contentId,
      content.sortOrder,
      rendered.imageEtag,
      rendered.audioEtag,
      rendered.groupEtag,
      rendered.contentEtag
    );
  }

  async ingestDashboard(
    contentId: string,
    payload: IngestPayloadT
  ): Promise<ContentMutationResponseT & { updatedAt: Date }> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: {
        sortOrder: true,
        kind: true,
        dynamicType: true,
      },
    });
    if (!content || content.kind !== 'dynamic' || content.dynamicType !== 'dashboard') {
      throw new NotFoundError('Dashboard content not found');
    }
    const rendered = await this.renderDynamicAndReadEtag(contentId, {
      force: true,
      dataOverride: payload.data,
    });
    return {
      ...toContentMutationResponse(
        contentId,
        content.sortOrder,
        rendered.imageEtag,
        rendered.audioEtag,
        rendered.groupEtag,
        rendered.contentEtag
      ),
      updatedAt: rendered.renderedAt,
    };
  }

  async refresh(
    contentId: string,
    ownerUserId: string
  ): Promise<ContentMutationResponseT & { updatedAt: Date }> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: {
        groupId: true,
        sortOrder: true,
        kind: true,
        dynamicType: true,
        group: { select: { ownerUserId: true } },
      },
    });
    if (!content) throw new NotFoundError('Content not found');
    if (content.kind !== 'dynamic' || !content.dynamicType)
      throw new ValidationError('Static content does not support manual refresh');
    if (content.group.ownerUserId !== ownerUserId) throw new NotFoundError('Content not found');
    const rendered = await this.renderDynamicAndReadEtag(contentId);
    return {
      ...toContentMutationResponse(
        contentId,
        content.sortOrder,
        rendered.imageEtag,
        rendered.audioEtag,
        rendered.groupEtag,
        rendered.contentEtag
      ),
      updatedAt: rendered.renderedAt,
    };
  }

  private parseDashboardPreviewData(dynamicType: string, rawData: unknown): unknown {
    if (dynamicType !== 'dashboard') return undefined;
    return this.parseDashboardData(rawData, 'Dashboard preview data cannot be empty');
  }

  private parseDashboardData(rawData: unknown, message: string): Record<string, unknown> {
    const parsed = DashboardDataPayload.safeParse(rawData);
    if (!parsed.success) {
      throw new ValidationError(message, { issues: parsed.error.issues });
    }
    return parsed.data;
  }

  private renderDynamicAndReadEtag(
    contentId: string,
    opts: Parameters<DynamicContentRendererService['renderDynamicContent']>[1] = { force: true }
  ): ReturnType<DynamicContentRendererService['renderDynamicContent']> {
    return this.renderer.renderDynamicContent(contentId, opts);
  }

  private runMutation<T>(contentId: string, fn: () => Promise<T>): Promise<T> {
    return this.mutationQueue.run(contentId, fn, { continueAfterFailure: true });
  }

  private async rollbackCreation(contentId: string, gid: string, err: unknown): Promise<void> {
    const stale = await this.prisma.content
      .findUnique({
        where: { id: contentId },
        select: { audioEtag: true },
      })
      .catch((staleErr: unknown) => {
        this.logger.warn(
          `Failed to read dynamic content rollback state for content ${contentId}: ${formatError(staleErr)}`
        );
        return null;
      });
    let rollbackOk = true;
    let rollbackError: string | null = null;
    await this.prisma
      .$transaction(async (tx) => {
        await lockGroupRow(tx, gid);
        await tx.content.delete({ where: { id: contentId } });
        await compactContentSortOrders(tx, gid);
        await this.groups.recomputeManifestEtag(gid, tx);
      })
      .catch((rollbackErr: unknown) => {
        rollbackOk = false;
        rollbackError = formatError(rollbackErr);
        this.logger.warn(
          `Database rollback failed after dynamic content creation failed for content ${contentId}: ${rollbackError}`
        );
      });
    if (!rollbackOk) {
      throw new InternalError(
        'Failed to create dynamic content and database rollback did not complete',
        {
          code: 'dynamic_create_rollback_failed',
          original_error: formatError(err),
          rollback_error: rollbackError,
        }
      );
    }
    const cleaned = await Promise.allSettled([
      this.blob.delete(gid, contentId, 'image'),
      deleteContentAudioBlob(this.blob, gid, contentId, stale?.audioEtag ?? null),
    ]);
    const failed = cleaned.filter((result) => result.status === 'rejected').length;
    if (failed > 0) {
      this.logger.warn(
        `Blob cleanup failed after dynamic content creation failed for content ${contentId}: ${failed} operation(s) failed.`
      );
    }
  }
}
