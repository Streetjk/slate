export const NAVIGATION_BUNDLE_RENDER_VERSION = 2;

const NAVIGATION_BUNDLE_DYNAMIC_TYPES = new Set([
  'btc_price',
  'daily_calendar',
  'month_calendar',
  'outlook_calendar',
]);

export function navigationBundleManifestToken(dynamicType: string | null): string {
  if (!dynamicType || !NAVIGATION_BUNDLE_DYNAMIC_TYPES.has(dynamicType)) return '';
  return `navigation-bundle:v${NAVIGATION_BUNDLE_RENDER_VERSION}`;
}
