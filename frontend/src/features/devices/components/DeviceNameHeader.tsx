import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { DeviceSummaryT } from 'shared';
import { InlineRename } from '@/components/ui/InlineRename';
import { cn } from '@/lib/cn';

export function DeviceNameHeader({
  device,
  online,
  editingName,
  draftName,
  onDraftNameChange,
  onStartEditing,
  onCommit,
  onKeyDown,
  pending,
}: {
  device: DeviceSummaryT;
  online: boolean;
  editingName: boolean;
  draftName: string;
  onDraftNameChange: (value: string) => void;
  onStartEditing: () => void;
  onCommit: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  pending: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 sm:px-7 pt-5 pb-3.5 border-b border-line">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 text-[12px] text-stone">
          <span className={cn('dot', online ? 'dot-online' : 'dot-offline')} />
          {online ? 'Online' : 'Offline'}
          <span className="font-mono text-[11px] text-stone-light">{device.mac}</span>
        </p>
        <div className="mt-1.5">
          <InlineRename
            editing={editingName}
            value={device.name ?? 'Unnamed device'}
            draft={draftName}
            onDraftChange={onDraftNameChange}
            onStart={onStartEditing}
            onCommit={onCommit}
            onKeyDown={onKeyDown}
            pending={pending}
            placeholder="Unnamed device"
            titleClassName="font-serif text-[24px] sm:text-[26px] font-bold leading-tight truncate"
            inputClassName="!text-[24px] sm:!text-[26px] !font-serif !font-bold leading-tight"
            buttonClassName="p-1.5 -m-1 text-stone"
            editIconSize={14}
            saveIconSize={16}
            renderTitle={(value, className) => (
              <Dialog.Title className={className}>{value}</Dialog.Title>
            )}
          />
        </div>
      </div>
      <Dialog.Close asChild>
        <button
          aria-label="Close"
          className="p-2 -m-2 text-stone hover:text-ink hover:bg-cream flex-shrink-0 transition-colors"
        >
          <X size={20} />
        </button>
      </Dialog.Close>
    </div>
  );
}
