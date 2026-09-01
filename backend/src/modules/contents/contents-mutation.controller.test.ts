import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import { ContentsMutationController } from './contents-mutation.controller';

describe('ContentsMutationController multipart parameters', () => {
  it('does not expose DTO metadata for the polymorphic JSON parameters', () => {
    const createTypes = Reflect.getMetadata(
      'design:paramtypes',
      ContentsMutationController.prototype,
      'create'
    ) as unknown[];
    const patchTypes = Reflect.getMetadata(
      'design:paramtypes',
      ContentsMutationController.prototype,
      'patch'
    ) as unknown[];

    // Multipart requests leave @JsonBody undefined; Object makes the global Zod pipe skip it.
    expect(createTypes[3]).toBe(Object);
    expect(patchTypes[3]).toBe(Object);
  });

  it('delegates BTC trio provisioning to the dynamic content service', async () => {
    const response = [{ id: 'daily' }, { id: 'weekly' }, { id: 'monthly' }];
    const dynamicContent = {
      appendBtcTrio: async (groupId: string, userId: string) => {
        expect(groupId).toBe('group-1');
        expect(userId).toBe('user-1');
        return response;
      },
    };
    const controller = new ContentsMutationController(
      undefined as never,
      dynamicContent as never,
      undefined as never
    );

    await expect(
      controller.createBtcTrio('group-1', { userId: 'user-1' } as never)
    ).resolves.toEqual(response);
  });
});
