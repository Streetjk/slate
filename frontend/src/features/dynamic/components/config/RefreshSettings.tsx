import { Select, SelectItem } from '@/components/ui/Select';
import type {
  DynamicConfigChange,
  RefreshableDynamicConfig,
} from '@/features/dynamic/model/config-types';

const DEFAULT_REFRESH_INTERVAL_SEC = 600;

export function DynamicRefreshSettings({
  config,
  onChange,
}: {
  config: RefreshableDynamicConfig;
  onChange: DynamicConfigChange;
}) {
  const current = config.refresh_interval_sec ?? DEFAULT_REFRESH_INTERVAL_SEC;
  return (
    <div>
      <p className="font-mono text-[10px] text-stone uppercase tracking-[0.18em] mb-1.5">
        Refresh interval
      </p>
      <Select
        value={String(current)}
        onValueChange={(value) => onChange({ ...config, refresh_interval_sec: Number(value) })}
      >
        {refreshOptions(config.type).map((item) => (
          <SelectItem key={item.value} value={String(item.value)} hint={item.hint}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

function refreshOptions(type?: string): Array<{
  value: number;
  label: string;
  hint: string;
}> {
  return [
    ...(type === 'dashboard' ? [{ value: 60, label: '1 minute', hint: 'High frequency' }] : []),
    { value: 300, label: '5 minutes', hint: 'More current' },
    { value: 600, label: '10 minutes', hint: 'Recommended' },
    { value: 1800, label: '30 minutes', hint: 'Power saving' },
    { value: 3600, label: '1 hour', hint: 'Low frequency' },
  ];
}
