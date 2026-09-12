import { describe, expect, it } from 'bun:test';
import { weatherLifecycleMarker } from './weather-lifecycle';

describe('weather lifecycle marker', () => {
  it('exposes only sanitized lifecycle state', () => {
    const content = {
      id: 'content-1',
      kind: 'dynamic',
      dynamic_type: 'weather',
      dynamic_render_error_present: true,
    } as never;

    expect(weatherLifecycleMarker(content)).toBe(
      '[slate] weather lifecycle marker stage=frontend_view type=weather error_present=1'
    );
  });

  it('ignores non-weather content', () => {
    expect(
      weatherLifecycleMarker({
        id: 'content-1',
        kind: 'dynamic',
        dynamic_type: 'news',
      } as never)
    ).toBeNull();
  });
});
