import { useEffect, useState } from 'react';
import type { DynamicConfigT } from 'shared';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  beginOutlookConnection,
  cancelOutlookDeviceFlow,
  connectOutlookIcs,
  disconnectOutlookIcs,
  getOutlookConnectionStatus,
  getOutlookDeviceFlow,
  getOutlookIcsStatus,
  type OutlookConnectionStatus,
  type OutlookDeviceFlow,
  type OutlookIcsStatus,
} from '@/features/dynamic/query/outlook-queries';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';

type ConnectionMode = 'microsoft' | 'ics';

export function OutlookCalendarConfigPanel({
  config,
  onChange,
}: {
  config: Extract<DynamicConfigT, { type: 'outlook_calendar' }>;
  onChange: DynamicConfigChange;
}) {
  const [status, setStatus] = useState<OutlookConnectionStatus | null>(null);
  const [icsStatus, setIcsStatus] = useState<OutlookIcsStatus | null>(null);
  const [mode, setMode] = useState<ConnectionMode>('microsoft');
  const [flow, setFlow] = useState<OutlookDeviceFlow | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [icsUrl, setIcsUrl] = useState('');
  const [icsSaving, setIcsSaving] = useState(false);
  const [icsError, setIcsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([getOutlookConnectionStatus(), getOutlookIcsStatus()])
      .then(([nextStatus, nextIcsStatus]) => {
        if (!active) return;
        setStatus(nextStatus);
        setIcsStatus(nextIcsStatus);
        if (nextIcsStatus.connected) setMode('ics');
      })
      .catch(() => {
        if (active) {
          setStatus(null);
          setIcsStatus(null);
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

  const saveIcs = async () => {
    const value = icsUrl.trim();
    if (!value) {
      setIcsError('Paste the published Outlook ICS URL first.');
      return;
    }
    setIcsError(null);
    setIcsSaving(true);
    try {
      const next = await connectOutlookIcs(value);
      setIcsStatus(next);
      setIcsUrl('');
      setMode('ics');
    } catch {
      setIcsError(
        'Slate could not validate that ICS feed. Check that it is the published Outlook .ics link.'
      );
    } finally {
      setIcsSaving(false);
    }
  };

  const removeIcs = async () => {
    setIcsError(null);
    setIcsSaving(true);
    try {
      await disconnectOutlookIcs();
      setIcsStatus({ connected: false });
      setIcsUrl('');
    } catch {
      setIcsError('Could not disconnect the ICS feed.');
    } finally {
      setIcsSaving(false);
    }
  };

  const waitingForUser = flow?.status === 'WAITING_USER' && flow.userCode && flow.verificationUri;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          Connection method
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === 'ics' ? 'primary' : 'outline'}
            onClick={() => setMode('ics')}
          >
            ICS feed
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'microsoft' ? 'primary' : 'outline'}
            onClick={() => setMode('microsoft')}
          >
            Microsoft login
          </Button>
        </div>
      </div>

      {mode === 'ics' ? (
        <div className="space-y-3 border border-line bg-cream p-3">
          <div>
            <p className="font-sans text-[12px] font-medium text-ink">Published Outlook ICS feed</p>
            <p className="mt-1 font-sans text-[11px] leading-5 text-stone">
              Paste the private .ics link from Outlook Web. Slate validates it, stores it encrypted
              on the Orange Pi, and never returns the saved URL to the browser or e-ink device.
            </p>
          </div>

          {icsStatus?.connected ? (
            <div className="border border-line bg-paper px-3 py-2 font-sans text-[11px] text-ink">
              ICS feed connected · encrypted URL stored securely
            </div>
          ) : null}

          <Input
            type="url"
            autoComplete="off"
            spellCheck={false}
            value={icsUrl}
            onChange={(event) => setIcsUrl(event.target.value)}
            placeholder={
              icsStatus?.connected
                ? 'Paste a new Outlook .ics URL to replace the saved feed'
                : 'Paste Outlook published .ics URL'
            }
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void saveIcs()} disabled={icsSaving}>
              {icsSaving ? (
                <Spinner />
              ) : icsStatus?.connected ? (
                'Replace ICS feed'
              ) : (
                'Save ICS feed'
              )}
            </Button>
            {icsStatus?.connected ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void removeIcs()}
                disabled={icsSaving}
              >
                Disconnect ICS
              </Button>
            ) : null}
          </div>

          {icsError ? (
            <p className="font-sans text-[11px] leading-5 text-clay">{icsError}</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="font-sans text-[12px] leading-relaxed text-stone">
            Sign in with your normal Microsoft company account; MFA stays on Microsoft&apos;s
            sign-in page. This method can still be blocked by your company&apos;s admin-consent
            policy.
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
            {status?.connected ? (
              <span className="truncate font-sans text-[11px] text-stone">
                {status.accountEmail ?? 'Connected'}
              </span>
            ) : null}
          </div>

          {status?.configured === false ? (
            <p className="font-sans text-[11px] leading-5 text-clay">
              Device-code login needs one Microsoft public-client Application ID. No client secret
              or callback URL is required.
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
        </div>
      )}

      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
