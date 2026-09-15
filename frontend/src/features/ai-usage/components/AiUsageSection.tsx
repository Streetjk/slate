import { Activity } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAiUsage, type AiUsageCard } from '../query/ai-usage-queries';
import { presentAiUsageCard } from '../presentation';

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
      </dl>
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
