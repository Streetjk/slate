import { useEffect, useMemo, useState } from 'react';
import {
  WEATHER_ALERT_PROVINCES,
  isWeatherAlertProvince,
  normalizeWeatherAlertProvince,
} from 'shared';
import { SearchDropdown } from '@/components/ui/SearchDropdown';

const WEATHER_ALERT_REGIONS: Array<{ label: string; value: string; hint?: string }> = [
  { label: 'National', value: '', hint: 'All alerts' },
  ...WEATHER_ALERT_PROVINCES.map((province) => ({
    label: province,
    value: province,
    hint: province.endsWith('市') ? 'Municipality' : undefined,
  })),
];

export function ProvinceSearch({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (province: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value ? regionLabel(value) : '');
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (focused) return;
    setQuery(value ? regionLabel(value) : '');
    setDirty(false);
    setOpen(false);
  }, [focused, value]);

  const results = useMemo(() => (dirty ? searchWeatherAlertRegions(query) : []), [dirty, query]);

  useEffect(() => {
    if (results.length > 0) setOpen(true);
    else if (dirty) setOpen(false);
  }, [dirty, results.length]);

  return (
    <SearchDropdown
      label="Region"
      value={query}
      onValueChange={(next) => {
        setQuery(next);
        setDirty(true);
      }}
      onFocus={() => {
        setFocused(true);
        setDirty(true);
        setOpen(true);
      }}
      onBlurCommit={(nextQuery) => {
        const next = regionValueFromInput(nextQuery);
        const normalized = isWeatherAlertRegionValue(next) ? next : value;
        onSelect(normalized);
        setQuery(normalized ? regionLabel(normalized) : '');
        setFocused(false);
        setDirty(false);
      }}
      placeholder="National or provincial region, e.g. Guangdong"
      results={results}
      open={open}
      onOpenChange={setOpen}
      getKey={regionKey}
      onSelect={(region) => {
        onSelect(region.value);
        setQuery(region.label);
        setDirty(false);
      }}
      renderItem={(region) => (
        <>
          {region.label}
          {region.hint && <span className="ml-2 text-stone text-[11px]">{region.hint}</span>}
        </>
      )}
      panelClassName="max-h-64 overflow-y-auto overscroll-contain"
    />
  );
}

function regionLabel(value: string): string {
  const normalized = normalizeWeatherAlertProvince(value);
  if (!normalized) return 'National';
  return WEATHER_ALERT_REGIONS.find((region) => region.value === normalized)?.label ?? value;
}

function regionKey(region: (typeof WEATHER_ALERT_REGIONS)[number]): string {
  return region.label;
}

function regionValueFromInput(value: string): string {
  return normalizeWeatherAlertProvince(value);
}

function isWeatherAlertRegionValue(value: string): boolean {
  return value === '' || isWeatherAlertProvince(value);
}

function searchWeatherAlertRegions(query: string): typeof WEATHER_ALERT_REGIONS {
  const q = query.trim();
  if (!q || q === 'National') return WEATHER_ALERT_REGIONS;
  const normalizedQuery = normalizeWeatherAlertProvince(q);
  return WEATHER_ALERT_REGIONS.filter((region) => {
    const normalized = region.label.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '');
    return (
      region.label.includes(q) ||
      region.value.includes(q) ||
      region.value === normalizedQuery ||
      normalized.includes(q)
    );
  });
}
