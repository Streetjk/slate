import { Radio } from 'lucide-react';
import type { GroupSummaryT } from 'shared';
import { Select, SelectItem, SelectSeparator } from '@/components/ui/Select';

export function DeviceGroupSelector({
  groups,
  value,
  onChange,
  disabled,
}: {
  groups: GroupSummaryT[];
  value: string | null;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2 text-stone">
        <Radio size={14} />
        <h3 className="font-sans text-[12px] uppercase tracking-wide">Playing</h3>
      </div>
      <GroupSelector groups={groups} value={value} onChange={onChange} disabled={disabled} />
      <p className="font-serif text-[12px] italic text-stone-light mt-2">
        Switching queues a sync action on the device immediately.
      </p>
    </section>
  );
}

function GroupSelector({
  groups,
  value,
  onChange,
  disabled,
}: {
  groups: GroupSummaryT[];
  value: string | null;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const showNone = value === null;
  return (
    <Select
      value={value ?? '__none__'}
      onValueChange={onChange}
      disabled={disabled}
      placeholder="No group selected"
      aria-label="Switch playing group"
    >
      {showNone && <SelectItem value="__none__">No group selected</SelectItem>}
      {showNone && groups.length > 0 && <SelectSeparator />}
      {groups.map((group) => (
        <SelectItem key={group.id} value={group.id} hint={`${group.content_count} items`}>
          <span className="font-serif">{group.name}</span>
        </SelectItem>
      ))}
    </Select>
  );
}
