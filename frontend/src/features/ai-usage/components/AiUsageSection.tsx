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
      ) : usage.data?.cards.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usage.data.cards.map((card) => (
            <UsageCard key={card.provider} card={card} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Activity size={26} />} title="Usage unavailable" />
      )}
    </Section>
  );
}

function UsageCard({ card }: { card: AiUsageCard }) {
  const status = card.sourceStatus === 'STALE' ? 'Stale' : card.sourceStatus.replaceAll('_', ' ');
  return (
    <article className="border border-ink bg-paper p-4 min-h-[150px]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-[22px] font-bold">{LABELS[card.provider]}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone">
          {status}
        </span>
      </div>
      <dl className="mt-4 space-y-2 font-sans text-[12px]">
        <Metric label="Used" value={percent(card.usedPercent)} />
        <Metric label="Remaining" value={percent(card.remainingPercent)} />
        <Metric
          label="Reset"
          value={card.resetAt ? new Date(card.resetAt).toLocaleString() : 'Unavailable'}
        />
        <Metric
          label="Session tokens"
          value={card.sessionTotalTokens?.toLocaleString() ?? 'Unavailable'}
        />
      </dl>
      <p className="mt-4 font-mono text-[10px] text-stone">
        Updated {card.lastUpdated ? new Date(card.lastUpdated).toLocaleString() : 'Unavailable'}
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

function percent(value: number | null): string {
  return value === null ? 'Unavailable' : `${value}%`;
}
