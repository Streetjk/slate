import { describe, expect, it } from 'bun:test';
import { DeviceAuthGuard } from './device-auth.guard';
import { CURRENT_DEVICE_KEY } from '../auth-context';

function context(request: unknown) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as never;
}

describe('DeviceAuthGuard', () => {
  it('rejects voice/config requests without an authenticated device secret', async () => {
    const guard = new DeviceAuthGuard({ authenticate: async () => null } as never);

    await expect(
      guard.canActivate(context({ headers: { authorization: 'Bearer not-a-device-secret' } }))
    ).rejects.toThrow('设备认证失败');
  });

  it('attaches the existing device identity after authenticating its secret', async () => {
    const device = { deviceId: 'device-1', mac: 'AA:BB:CC:DD:EE:FF' };
    const request = { headers: { authorization: `Bearer ${'a'.repeat(64)}` } };
    const guard = new DeviceAuthGuard({ authenticate: async () => device } as never);

    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request).toHaveProperty(CURRENT_DEVICE_KEY, device);
  });
});
