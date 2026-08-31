// 按设备屏上的 6 位配对码绑定设备。
//
// 流程：用户拿到一台已经联网但未绑定的 Slate 设备 → 设备屏上显示配对码 →
// 用户在此对话框输入 → 后端找到 device、把 owner 设为当前用户、轮换 pair_code。
//
// 命名留到绑定后在设备列表 PATCH name。

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, KeyRound } from 'lucide-react';
import { useClaimByPairCode } from '@/features/devices/query/device-queries';
import { useToast } from '@/components/feedback/toast-context';
import { isValidPairCode, normalizePairCode } from '@/features/devices/lib/pair-code';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-errors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DialogHeader } from '@/components/ui/DialogHeader';
import { dialogContentCls, dialogOverlayCls } from '@/components/ui/styles/dialog';

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AddDeviceDialog({ open, onOpenChange }: AddDeviceDialogProps) {
  const [code, setCode] = useState('');
  const claim = useClaimByPairCode();
  const toast = useToast();

  const codeValid = isValidPairCode(code);

  function reset() {
    setCode('');
  }

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!codeValid) return;
    try {
      const device = await claim.mutateAsync({ pair_code: normalizePairCode(code) });
      // 后端 claim 时若 owner 已有相册会自动绑第一个，无相册则后续 create 会反向绑；
      // 这里只给出与实际后端行为一致的概要提示，不做额外引导（用户可在设备列表看进度）。
      toast.success(
        'Device bound',
        device.selected_group_id
          ? 'The device will start syncing its group'
          : 'Create a group and the device will sync it automatically'
      );
      reset();
      onOpenChange(false);
    } catch (err) {
      const status = getApiErrorStatus(err);
      if (status === 404) {
        toast.error(
          'Invalid pairing code',
          'Check the code on the device, or hold ENTER on the device to factory-reset it and try again.'
        );
      } else if (status === 403) {
        toast.error(
          'Device is bound to another account',
          'Factory-reset the device and try again.'
        );
      } else {
        toast.error('Binding failed', getApiErrorMessage(err));
      }
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={dialogOverlayCls} />
        <Dialog.Content className={dialogContentCls}>
          <DialogHeader
            icon={<KeyRound size={24} />}
            title="Add device"
            description="Find the 6-character pairing code on the device and enter it here to bind the device."
            className="mb-6"
          />

          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label="Pairing code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="K7M9X2"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              hint={code && !codeValid ? undefined : '6 letters and numbers; hyphens are allowed'}
              error={code && !codeValid ? 'Invalid pairing code format' : undefined}
              className="font-mono uppercase tracking-[0.2em] text-center"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                disabled={!codeValid || claim.isPending}
                iconRight={claim.isPending ? undefined : <ArrowRight size={14} />}
              >
                {claim.isPending ? <Spinner /> : 'Bind'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
