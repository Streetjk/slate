import { describe, expect, it } from 'bun:test';
import {
  NAVIGATION_BUNDLE_RENDER_VERSION,
  navigationBundleManifestToken,
} from './dynamic-navigation-version';

describe('navigationBundleManifestToken', () => {
  it('versions every local-navigation dynamic type', () => {
    const expected = `navigation-bundle:v${NAVIGATION_BUNDLE_RENDER_VERSION}`;
    expect(navigationBundleManifestToken('btc_price')).toBe(expected);
    expect(navigationBundleManifestToken('daily_calendar')).toBe(expected);
    expect(navigationBundleManifestToken('month_calendar')).toBe(expected);
    expect(navigationBundleManifestToken('outlook_calendar')).toBe(expected);
  });

  it('does not perturb unrelated content etags', () => {
    expect(navigationBundleManifestToken('weather')).toBe('');
    expect(navigationBundleManifestToken(null)).toBe('');
  });
});
