import { Activity } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAiUsage, type AiUsageCard } from '../query/ai-usage-queries';

const LABELS: Record<AiUsageCard['provider'], string> = {
  codex: 'Codex',
  agy_gemini: 'AGY / Gemini',
  grok: 'Grok',
};

const KNOWN_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  UNAVAILABLE_NO_MACHINE_READABLE_USAGE: 'Unavailable no machine readable usage',
  ERROR: 'Error',
  STALE: 'Stale',
};

export function AiUsageSection() {
  const usage = useAiUsage();
  return (
    <Section
      title="AI usage"
      subtitle="Read-only local usage sources; unavailable metrics are never guessed."
      badge={<Activity size={18} />}
    >
      {usage.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner label="Loading" />
        </div>
      ) : usage.data?.cards?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  const status = formatSourceStatus(card?.sourceStatus);
  const providerLabel = (card?.provider && LABELS[card.provider]) || 'Unknown';

  return (
    <article className="border border-ink bg-paper p-4 min-h-[150px]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[22px] font-bold">{providerLabel}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">
          {status}
        </span>
      </div>
      <dl className="mt-4 space-y-2 font-sans text-[12px]">
        <Metric label="Used" value={formatPercentage(card?.usedPercent)} />
        <Metric label="Remaining" value={formatPercentage(card?.remainingPercent)} />
        <Metric label="Reset" value={formatDate(card?.resetAt)} />
        <Metric label="Session tokens" value={formatTokens(card?.sessionTotalTokens)} />
      </dl>
      <p className="mt-4 font-mono text-[10px] text-stone">
        Updated {formatDate(card?.lastUpdated)}
      </p>
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

function formatSourceStatus(status: unknown): string {
  if (typeof status === 'string' && status in KNOWN_STATUS_LABELS) {
    return KNOWN_STATUS_LABELS[status];
  }
  return 'Unavailable';
}

function formatPercentage(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    return 'Unavailable';
  }
  return `${value}%`;
}

function formatDate(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Unavailable';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unavailable';
  }
  return parsed.toLocaleString();
}

function formatTokens(value: unknown): string {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return 'Unavailable';
  }
  return value.toLocaleString();
}
