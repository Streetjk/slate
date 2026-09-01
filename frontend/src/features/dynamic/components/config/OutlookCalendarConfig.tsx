import { useEffect, useState } from 'react';
import type { DynamicConfigT } from 'shared';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  beginOutlookConnection,
  getOutlookConnectionStatus,
  type OutlookConnectionStatus,
} from '@/features/dynamic/query/outlook-queries';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';

export function OutlookCalendarConfigPanel({
  config,
  onChange,
}: {
  config: Extract<DynamicConfigT, { type: 'outlook_calendar' }>;
  onChange: DynamicConfigChange;
}) {
  const [status, setStatus] = useState<OutlookConnectionStatus | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let active = true;
    void getOutlookConnectionStatus()
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => {
        if (active) setStatus(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      await beginOutlookConnection();
    } catch {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-sans text-[12px] leading-relaxed text-stone">
        Outlook is read-only. The agenda uses Australia/Perth time and is refreshed server-side.
      </p>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={() => void connect()} disabled={connecting}>
          {connecting ? <Spinner /> : status?.connected ? 'Reconnect Outlook' : 'Connect Outlook'}
        </Button>
        {status?.connected && (
          <span className="font-sans text-[11px] text-stone truncate">
            {status.accountEmail ?? 'Connected'}
          </span>
        )}
      </div>
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
