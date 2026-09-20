import { useEffect, useState } from 'react';
import { Activity, Check, Copy, ExternalLink, LogIn, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import {
  useAiUsage,
  useAiUsageDeviceAuth,
  useCancelAiUsageDeviceAuth,
  useStartAiUsageDeviceAuth,
  type AiUsageCard,
  type AiUsageDeviceAuthProvider,
} from '../query/ai-usage-queries';
import { presentAiUsageCard } from '../presentation';

export function AiUsageSection() {
  const usage = useAiUsage();
  return (
    <Section
      title="AI usage"
      subtitle="Mac-hosted CLI usage + OAuth status. Provider tokens stay on the Mac and are never returned to Slate."
      badge={<Activity size={18} />}
    >
      {usage.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner label="Loading" />
        </div>
      ) : usage.data?.cards?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {usage.data.cards.map((card, index) => (
            <UsageCard key={card?.provider ?? index} card={card} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Activity size={26} />} title="Usage unavailable" />
      )}
    </Section>
  );
}

function UsageCard({ card }: { card: AiUsageCard }) {
  const presented = presentAiUsageCard(card);
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState<'command' | 'code' | null>(null);
  const [flowId, setFlowId] = useState<string | null>(null);
  const startAuth = useStartAiUsageDeviceAuth();
  const authFlow = useAiUsageDeviceAuth(flowId);
  const cancelAuth = useCancelAiUsageDeviceAuth();
  const flow = authFlow.data;
  const authConnected = card.auth.status === 'LOCAL_AUTH_PRESENT' || flow?.status === 'COMPLETED';

  useEffect(() => {
    if (flow?.status !== 'COMPLETED') return;
    void queryClient.refetchQueries({ queryKey: ['ai-usage'], type: 'active' }).then(() => {
      setFlowId(null);
    });
  }, [flow?.status, queryClient]);

  const copyValue = async (value: string, kind: 'command' | 'code') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  };

  const startDeviceLogin = () => {
    setCopied(null);
    startAuth.mutate(card.provider as AiUsageDeviceAuthProvider, {
      onSuccess: (result) => setFlowId(result.flowId),
    });
  };

  const cancelDeviceLogin = () => {
    if (!flowId) return;
    cancelAuth.mutate(flowId, {
      onSuccess: () => setFlowId(null),
    });
  };

  return (
    <details
      className="group border border-ink bg-paper min-h-[150px] transition-colors open:bg-cream/40"
      onToggle={(event) => {
        if (!(event.currentTarget as HTMLDetailsElement).open) setCopied(null);
      }}
    >
      <summary className="list-none cursor-pointer p-4 outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-inset hover:bg-cream/60">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[22px] font-bold">{presented.providerLabel}</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">
            {presented.statusLabel}
          </span>
        </div>
        <p className="mt-2 font-mono text-[10px] text-stone">
          {presented.availabilityLabel} · {presented.sourceLabel} · {presented.freshnessLabel}
        </p>
        <dl className="mt-4 space-y-2 font-sans text-[12px]">
          <Metric label="CLI version" value={presented.versionLabel} />
          <Metric label="Used" value={presented.usedLabel} />
          <Metric label="Remaining" value={presented.remainingLabel} />
          <Metric label="Reset" value={presented.resetLabel} />
          <Metric label="Session tokens" value={presented.sessionTokensLabel} />
          <Metric
            label={presented.authModeLabel}
            value={authConnected ? 'Connected' : presented.authStatusLabel}
          />
        </dl>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
            <LogIn size={14} />
            OAuth login
          </span>
          <span
            className="font-mono text-[11px] text-stone transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            →
          </span>
        </div>
        <p className="mt-3 font-mono text-[10px] text-stone">Updated {presented.updatedLabel}</p>
      </summary>
      <div className="mx-4 mb-4 border border-line bg-cream p-3">
        {card.auth.deviceAuthAvailable ? (
          <DeviceAuthPanel
            flow={flow}
            pending={startAuth.isPending || authFlow.isFetching}
            error={
              startAuth.error instanceof Error
                ? startAuth.error.message
                : authFlow.error instanceof Error
                  ? authFlow.error.message
                  : null
            }
            copied={copied}
            onStart={startDeviceLogin}
            onCancel={cancelDeviceLogin}
            onCopyCode={(code) => copyValue(code, 'code')}
          />
        ) : (
          <CommandLoginPanel
            hint={presented.loginHint}
            command={presented.loginCommand}
            copied={copied === 'command'}
            onCopy={() => copyValue(presented.loginCommand, 'command')}
          />
        )}
      </div>
    </details>
  );
}

function DeviceAuthPanel({
  flow,
  pending,
  error,
  copied,
  onStart,
  onCancel,
  onCopyCode,
}: {
  flow: ReturnType<typeof useAiUsageDeviceAuth>['data'];
  pending: boolean;
  error: string | null;
  copied: 'command' | 'code' | null;
  onStart: () => void;
  onCancel: () => void;
  onCopyCode: (code: string) => void;
}) {
  if (!flow) {
    return (
      <>
        <p className="font-sans text-[11px] leading-5 text-stone">
          Start a provider device-login flow. Slate will show only the sign-in URL and one-time
          code; OAuth tokens remain on the Mac mini.
        </p>
        <Button
          className="mt-3"
          variant="primary"
          size="sm"
          iconLeft={<LogIn size={14} />}
          onClick={onStart}
          disabled={pending}
        >
          {pending ? 'Starting…' : 'Start device login'}
        </Button>
        {error ? <p className="mt-2 font-mono text-[10px] text-clay">{error}</p> : null}
      </>
    );
  }

  const active = flow.status === 'STARTING' || flow.status === 'WAITING_USER';
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">
        {deviceAuthStatusLabel(flow.status)}
      </p>
      {flow.verificationUri ? (
        <a
          className="mt-3 inline-flex h-9 items-center justify-center gap-2 border border-ink bg-ink px-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-paper hover:bg-stone"
          href={flow.verificationUri}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={14} /> Open sign-in page
        </a>
      ) : active ? (
        <p className="mt-3 font-sans text-[11px] text-stone">
          Waiting for the provider sign-in URL…
        </p>
      ) : null}
      {flow.userCode ? (
        <div className="mt-3">
          <p className="font-sans text-[11px] text-stone">One-time device code</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="border border-line bg-paper px-2 py-1 font-mono text-[13px] font-bold tracking-[0.12em] text-ink">
              {flow.userCode}
            </code>
            <Button
              variant="soft"
              size="sm"
              iconLeft={copied === 'code' ? <Check size={14} /> : <Copy size={14} />}
              onClick={() => onCopyCode(flow.userCode!)}
            >
              {copied === 'code' ? 'Copied' : 'Copy code'}
            </Button>
          </div>
        </div>
      ) : null}
      {flow.error ? <p className="mt-3 font-mono text-[10px] text-clay">{flow.error}</p> : null}
      {flow.status === 'COMPLETED' ? (
        <p className="mt-3 font-sans text-[11px] font-medium text-ink">
          OAuth login completed on the Mac mini.
        </p>
      ) : null}
      {active ? (
        <Button
          className="mt-3"
          variant="outline"
          size="sm"
          iconLeft={<X size={14} />}
          onClick={onCancel}
        >
          Cancel
        </Button>
      ) : flow.status !== 'COMPLETED' ? (
        <Button className="mt-3" variant="outline" size="sm" onClick={onStart}>
          Start again
        </Button>
      ) : null}
    </>
  );
}

function CommandLoginPanel({
  hint,
  command,
  copied,
  onCopy,
}: {
  hint: string;
  command: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <>
      <p className="font-sans text-[11px] leading-5 text-stone">{hint}</p>
      <code className="mt-2 block break-all font-mono text-[11px] text-ink">{command}</code>
      <Button
        className="mt-3"
        variant="soft"
        size="sm"
        iconLeft={copied ? <Check size={14} /> : <Copy size={14} />}
        onClick={onCopy}
      >
        {copied ? 'Copied' : 'Copy command'}
      </Button>
    </>
  );
}

function deviceAuthStatusLabel(status: string): string {
  switch (status) {
    case 'STARTING':
      return 'Starting device login';
    case 'WAITING_USER':
      return 'Waiting for sign-in';
    case 'COMPLETED':
      return 'Connected';
    case 'FAILED':
      return 'Login failed';
    case 'EXPIRED':
      return 'Login expired';
    case 'CANCELLED':
      return 'Login cancelled';
    default:
      return 'OAuth status unknown';
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
