import { describe, expect, it } from 'bun:test';
import { DeviceCurrentContentService } from './device-current-content.service';

describe('DeviceCurrentContentService local navigation fallback', () => {
  it('resyncs instead of persisting Outlook Up/Down navigation', async () => {
    let navigateCalls = 0;
    const service = new DeviceCurrentContentService(
      {
        device: {
          findUnique: async () => ({
            id: 'device-1',
            selectedGroupId: 'group-1',
            selectedGroup: { manifestEtag: 'manifest-1' },
          }),
        },
        content: {
          findUnique: async () => ({
            id: 'content-1',
            groupId: 'group-1',
            sortOrder: 2,
            kind: 'dynamic',
            dynamicType: 'outlook_calendar',
          }),
        },
      } as never,
      {} as never,
      {
        navigateDeviceView: async () => {
          navigateCalls += 1;
          return { handled: true, manifestEtag: 'mutated' };
        },
      } as never
    );

    const result = await service.navigateCurrentContent('device-1', {
      seq: 2,
      manifest_etag: 'manifest-1',
      direction: 'next',
    });

    expect(result).toEqual({
      handled: false,
      stale: true,
      manifest_etag: null,
      content: null,
    });
    expect(navigateCalls).toBe(0);
  });
});
