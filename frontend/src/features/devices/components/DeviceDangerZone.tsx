import { Unlink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function DeviceDangerZone({
  pending,
  onUnbind,
}: {
  pending: boolean;
  onUnbind: () => void;
}) {
  return (
    <section className="pt-2">
      <Button
        variant="danger"
        size="sm"
        iconLeft={<Unlink size={14} />}
        onClick={onUnbind}
        disabled={pending}
      >
        {pending ? <Spinner /> : 'Unbind from account'}
      </Button>
      <p className="font-serif text-[11px] italic text-stone-light mt-2">
        Unbinding removes the device from your account but keeps its content. Add it again to
        restore access.
      </p>
    </section>
  );
}
