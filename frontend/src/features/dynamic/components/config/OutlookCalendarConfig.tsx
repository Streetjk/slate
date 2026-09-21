import { useEffect, useState } from 'react';
import type { DynamicConfigT } from 'shared';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  beginOutlookConnection,
  cancelOutlookDeviceFlow,
  getOutlookConnectionStatus,
  getOutlookDeviceFlow,
  type OutlookConnectionStatus,
  type OutlookDeviceFlow,
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
  const [flow, setFlow] = useState<OutlookDeviceFlow | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const flowId = flow?.flowId ?? null;
  const flowStatus = flow?.status ?? null;

  useEffect(() => {
    if (!flowId || !flowStatus || !['STARTING', 'WAITING_USER'].includes(flowStatus)) return;
    let active = true;
    const timer = window.setInterval(() => {
      void getOutlookDeviceFlow(flowId)
        .then(async (next) => {
          if (!active) return;
          setFlow(next);
          if (next.status === 'COMPLETED') {
            const nextStatus = await getOutlookConnectionStatus();
            if (active) {
              setStatus(nextStatus);
              setConnecting(false);
            }
          } else if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(next.status)) {
            setConnecting(false);
          }
        })
        .catch(() => {
          if (active) {
            setConnecting(false);
            setConnectionError('Could not read Microsoft sign-in status.');
          }
        });
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [flowId, flowStatus]);

  const connect = async () => {
    setConnectionError(null);
    setCopied(false);
    if (status?.configured === false) {
      setConnectionError(
        'Microsoft company-account login needs one Entra application/client ID on this Slate server.'
      );
      return;
    }
    setConnecting(true);
    try {
      const started = await beginOutlookConnection();
      setFlow(started);
      if (['FAILED', 'EXPIRED', 'CANCELLED'].includes(started.status)) {
        setConnecting(false);
      }
    } catch {
      setConnectionError('Could not start Microsoft company-account sign-in.');
      setConnecting(false);
    }
  };

  const cancel = async () => {
    if (!flow) return;
    try {
      await cancelOutlookDeviceFlow(flow.flowId);
    } finally {
      setFlow({ ...flow, status: 'CANCELLED', error: null });
      setConnecting(false);
    }
  };

  const copyCode = async () => {
    if (!flow?.userCode) return;
    try {
      await navigator.clipboard.writeText(flow.userCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const waitingForUser = flow?.status === 'WAITING_USER' && flow.userCode && flow.verificationUri;

  return (
    <div className="space-y-3">
      <p className="font-sans text-[12px] leading-relaxed text-stone">
        Outlook is read-only. Sign in with your normal Microsoft company account; MFA stays on
        Microsoft&apos;s sign-in page.
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
            'Microsoft app ID required'
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
          Device-code login is ready, but Microsoft still requires one public-client Application
          (client) ID. No client secret or callback URL is needed for the normal sign-in flow.
        </p>
      ) : null}

      {waitingForUser ? (
        <div className="border border-line bg-cream p-3">
          <p className="font-sans text-[11px] leading-5 text-stone">
            Open Microsoft sign-in, enter this one-time code, then sign in with your company
            account.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="border border-line bg-paper px-3 py-2 font-mono text-[14px] font-semibold tracking-[0.16em] text-ink">
              {flow.userCode}
            </code>
            <Button type="button" size="sm" onClick={() => void copyCode()}>
              {copied ? 'Copied' : 'Copy code'}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={flow.verificationUri ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center border border-ink bg-ink px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-paper"
            >
              Open Microsoft sign-in
            </a>
            <Button type="button" size="sm" variant="outline" onClick={() => void cancel()}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {flow?.status === 'COMPLETED' ? (
        <p className="font-sans text-[11px] leading-5 text-ink">
          Microsoft Outlook connected successfully.
        </p>
      ) : null}

      {flow && ['FAILED', 'EXPIRED'].includes(flow.status) ? (
        <p className="font-sans text-[11px] leading-5 text-clay">
          {flow.error ?? 'Microsoft sign-in did not complete. Please try again.'}
        </p>
      ) : null}

      {connectionError ? (
        <p className="font-sans text-[11px] leading-5 text-clay">{connectionError}</p>
      ) : null}

      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
