import { useCallback } from 'react';
import type { DeviceSummaryT } from 'shared';
import { useConfirmAction } from '@/hooks/useMutationAction';
import { useUnbindDevice } from '@/features/devices/query/device-queries';

export function useUnbindDeviceWithConfirm(device: DeviceSummaryT, onSuccess?: () => void) {
  const { mutate, isPending } = useUnbindDevice();

  const confirmUnbind = useConfirmAction<string>({
    isPending,
    getConfirmOptions: useCallback(
      () => ({
        title: 'Unbind this device?',
        description: `${device.name ?? device.mac} will be removed from your account. Content stays on the device, which will return to pairing-code mode.`,
        destructive: true,
        confirmText: 'Unbind',
      }),
      [device.mac, device.name]
    ),
    run: useCallback((deviceId, callbacks) => mutate(deviceId, callbacks), [mutate]),
    successToast: { message: 'Unbound', hint: 'The device will show a new pairing code.' },
    errorToast: 'Unbind failed',
    onSuccess: useCallback(() => onSuccess?.(), [onSuccess]),
  });
  const unbindWithConfirm = useCallback(() => {
    void confirmUnbind(device.id);
  }, [confirmUnbind, device.id]);

  return { unbindWithConfirm, isPending };
}
