import { describe, expect, it } from 'bun:test';
import { MIN_DYNAMIC_WAKE_SEC, contentToDetail, nextWakeSec } from './content-presenter';

describe('nextWakeSec', () => {
  const now = new Date('2026-01-01T00:00:00.000Z').getTime();

  it('returns null for static frames (no nextRunAt)', () => {
    expect(nextWakeSec(null, now)).toBeNull();
  });

  it('returns remaining seconds for a future refresh', () => {
    expect(nextWakeSec(new Date(now + 3600_000), now)).toBe(3600);
  });

  it('floors a due / overdue dynamic frame to the minimum instead of 0', () => {
    expect(nextWakeSec(new Date(now), now)).toBe(MIN_DYNAMIC_WAKE_SEC);
    expect(nextWakeSec(new Date(now - 10_000), now)).toBe(MIN_DYNAMIC_WAKE_SEC);
  });

  it('floors a sub-minimum positive interval to the minimum', () => {
    expect(nextWakeSec(new Date(now + 5_000), now)).toBe(MIN_DYNAMIC_WAKE_SEC);
  });
});

describe('content presenter weather error lifecycle marker', () => {
  it('marks whether an error is present without adding another content-bearing field', () => {
    const base = {
      id: 'content-1',
      groupId: 'group-1',
      sortOrder: 0,
      frameName: 'Weather',
      contentEtag: 'content',
      imageEtag: 'image',
      audioEtag: null,
      imageSize: 1,
      audioSize: null,
      audioStatus: 'none',
      audioSource: null,
      audioVoice: null,
      kind: 'dynamic',
      dynamicType: 'weather',
      dynamicConfig: { type: 'weather', provider: 'open_meteo' },
      dynamicData: null,
      dynamicLastRunAt: null,
    };

    expect(contentToDetail(base as never)).toMatchObject({
      dynamic_render_error: null,
      dynamic_render_error_present: false,
    });
    expect(
      contentToDetail({ ...base, dynamicLastError: 'Invalid configuration' } as never)
    ).toMatchObject({
      dynamic_render_error: 'Invalid configuration',
      dynamic_render_error_present: true,
    });
  });
});
