import { useState } from 'react';
import { Activity, Check, Copy, LogIn } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAiUsage, type AiUsageCard } from '../query/ai-usage-queries';
import { presentAiUsageCard } from '../presentation';

export function AiUsageSection() {
  const usage = useAiUsage();
  return (
    <Section
      title="AI usage"
      subtitle="Local usage + OAuth status. Provider credentials stay in the provider CLI and are never returned to Slate."
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
  const [showLogin, setShowLogin] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLoginCommand = async () => {
    try {
      await navigator.clipboard.writeText(presented.loginCommand);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="border border-ink bg-paper p-4 min-h-[150px]">
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
        <Metric label={presented.authModeLabel} value={presented.authStatusLabel} />
      </dl>
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          iconLeft={<LogIn size={14} />}
          onClick={() => {
            setShowLogin((value) => !value);
            setCopied(false);
          }}
        >
          OAuth login
        </Button>
        {showLogin ? (
          <div className="mt-3 border border-line bg-cream p-3">
            <p className="font-sans text-[11px] leading-5 text-stone">{presented.loginHint}</p>
            <code className="mt-2 block break-all font-mono text-[11px] text-ink">
              {presented.loginCommand}
            </code>
            <Button
              className="mt-3"
              variant="soft"
              size="sm"
              iconLeft={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copyLoginCommand}
            >
              {copied ? 'Copied' : 'Copy command'}
            </Button>
          </div>
        ) : null}
      </div>
      <p className="mt-4 font-mono text-[10px] text-stone">Updated {presented.updatedLabel}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
