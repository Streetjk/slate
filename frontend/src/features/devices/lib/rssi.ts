export function rssiLabel(rssi: number | null): string {
  if (rssi == null) return '—';
  if (rssi >= -65) return 'Good';
  if (rssi >= -75) return 'Fair';
  if (rssi >= -85) return 'Weak';
  return 'Very weak';
}
