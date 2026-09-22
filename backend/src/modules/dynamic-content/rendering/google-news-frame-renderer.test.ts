import { createHash } from 'node:crypto';
import { describe, expect, it } from 'bun:test';
import { FRAME_BYTES } from 'shared';
import { DynamicFrameRendererService } from './dynamic-frame-renderer.service';
import { DynamicFrameFontService } from './fonts/dynamic-frame-font.service';

describe('Google News frame renderer', () => {
  it('renders distinct AU and TW editions as fixed-size frames', async () => {
    const renderer = new DynamicFrameRendererService(new DynamicFrameFontService());
    const base = {
      type: 'google_news' as const,
      frameName: 'Google News',
      config: { type: 'google_news' as const, edition: 'both' as const },
      renderedAt: new Date('2026-09-01T13:00:00Z'),
    };
    const au = await renderer.render({
      ...base,
      data: {
        sections: [
          {
            edition: 'au',
            label: 'AU',
            items: [{ title: 'Perth trains updated', source: 'ABC News' }],
          },
        ],
      },
    });
    const tw = await renderer.render({
      ...base,
      data: {
        sections: [
          { edition: 'tw', label: 'TW', items: [{ title: '臺灣新聞焦點', source: '中央社' }] },
        ],
      },
    });
    expect(au.byteLength).toBe(FRAME_BYTES);
    expect(tw.byteLength).toBe(FRAME_BYTES);
    expect(createHash('sha256').update(au).digest('hex')).not.toBe(
      createHash('sha256').update(tw).digest('hex')
    );
  });
});
