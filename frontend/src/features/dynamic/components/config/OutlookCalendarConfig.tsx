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
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getOutlookConnectionStatus()
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => {
        if (active) {
          setStatus(null);
          setConnectionError('Could not read Outlook connection status.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const connect = async () => {
    setConnectionError(null);
    if (status?.configured === false) {
      setConnectionError(
        'Microsoft Outlook OAuth is not configured on this Slate server. Add the Microsoft app client ID and secret first.'
      );
      return;
    }
    setConnecting(true);
    try {
      await beginOutlookConnection();
    } catch {
      setConnectionError('Could not start Microsoft Outlook sign-in.');
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-sans text-[12px] leading-relaxed text-stone">
        Outlook is read-only. The agenda uses Australia/Perth time and is refreshed server-side.
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={() => void connect()}
          disabled={connecting || status?.configured === false}
        >
          {connecting ? (
            <Spinner />
          ) : status?.configured === false ? (
            'Outlook setup required'
          ) : status?.connected ? (
            'Reconnect Outlook'
          ) : (
            'Connect Outlook'
          )}
        </Button>
        {status?.connected && (
          <span className="font-sans text-[11px] text-stone truncate">
            {status.accountEmail ?? 'Connected'}
          </span>
        )}
      </div>
      {status?.configured === false ? (
        <p className="font-sans text-[11px] leading-5 text-clay">
          Microsoft OAuth is not configured on this Slate server. Register the Slate callback URL in
          Microsoft Entra, then add the client ID and client secret to the server.
        </p>
      ) : null}
      {connectionError ? (
        <p className="font-sans text-[11px] leading-5 text-clay">{connectionError}</p>
      ) : null}
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
