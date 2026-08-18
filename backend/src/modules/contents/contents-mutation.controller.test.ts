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
});
