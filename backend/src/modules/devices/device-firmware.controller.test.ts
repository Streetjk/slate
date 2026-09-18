import { describe, expect, it, spyOn } from 'bun:test';
import { DeviceAuthGuard } from '../../common/nest/guards/device-auth.guard';
import { DeviceFirmwareController } from './device-firmware.controller';

describe('DeviceFirmwareController', () => {
  it('returns only the Slate voice WebSocket path and protocol version', () => {
    const controller = new DeviceFirmwareController({} as never, {} as never);

    expect(controller.voiceConfig()).toEqual({
      websocket: { path: '/api/v1/voice/websocket', version: 1 },
    });
  });

  it('returns the service-normalized MAC address in register responses', async () => {
    const controller = new DeviceFirmwareController(
      {
        registerOrReset: async () => ({
          deviceId: 'device-1',
          deviceSecret: 'a'.repeat(64),
          pairCode: 'ABC123',
          reclaimed: false,
          serverTime: '2026-05-28T00:00:00.000Z',
        }),
      } as never,
      {} as never
    );

    await expect(controller.register({ mac: 'aa-bb-cc-dd-ee-ff' })).resolves.toMatchObject({
      mac: 'AA:BB:CC:DD:EE:FF',
    });
  });

  it('delegates poll handling to DeviceFirmwareService', async () => {
    let receivedDeviceId: string | null = null;
    let receivedTelemetry: unknown;
    const controller = new DeviceFirmwareController(
      {
        poll: async (deviceId: string, telemetry: unknown) => {
          receivedDeviceId = deviceId;
          receivedTelemetry = telemetry;
          return {
            device: {
              id: 'device-1',
              mac: 'AA:BB:CC:DD:EE:FF',
              name: null,
              bound: true,
              pair_code: null,
              server_time: '2026-05-28T00:00:00.000Z',
            },
            group: {
              id: 'group-1',
              structure_etag: 'structure-1',
              manifest_etag: 'manifest-1',
              name: 'Group',
              content_count: 3,
              sort_order: 0,
              position: { current: 1, total: 1 },
            },
            current_content: null,
          };
        },
      } as never,
      {} as never
    );

    const telemetry = {
      wake_reason: 'button',
      current_group: 'group-1',
      current_content_seq: 2,
      manifest_etag: 'manifest-1',
    };
    const state = await controller.poll({ deviceId: 'device-1', mac: 'AA:BB:CC:DD:EE:FF' }, {
      telemetry,
    } as never);

    expect(receivedDeviceId).toBe('device-1');
    expect(receivedTelemetry).toEqual(telemetry);
    expect(state.current_content).toBeNull();
  });

  it('emits DEVICE_AUTHENTICATED_POLL_RESULT=PASS on successful authenticated poll without private data', async () => {
    const loggedMessages: string[] = [];
    const controller = new DeviceFirmwareController(
      {
        poll: async () => ({
          device: {
            id: 'device-1',
            mac: 'AA:BB:CC:DD:EE:FF',
            name: null,
            bound: true,
            pair_code: null,
            server_time: '2026-05-28T00:00:00.000Z',
          },
          group: null,
          current_content: null,
        }),
      } as never,
      {} as never
    );

    const logSpy = spyOn(
      (controller as unknown as { logger: { log: (msg: string) => void } }).logger,
      'log'
    ).mockImplementation((msg: string) => {
      loggedMessages.push(msg);
    });

    const result = await controller.poll({ deviceId: 'device-1', mac: 'AA:BB:CC:DD:EE:FF' }, {
      telemetry: { wake_reason: 'timer' },
    } as never);

    expect(result.device.id).toBe('device-1');
    expect(loggedMessages).toContain('DEVICE_AUTHENTICATED_POLL_RESULT=PASS');
    expect(logSpy).toHaveBeenCalledWith('DEVICE_AUTHENTICATED_POLL_RESULT=PASS');

    for (const msg of loggedMessages) {
      if (msg.includes('DEVICE_AUTHENTICATED_POLL_RESULT')) {
        expect(msg).toBe('DEVICE_AUTHENTICATED_POLL_RESULT=PASS');
        expect(msg).not.toContain('device-1');
        expect(msg).not.toContain('AA:BB:CC:DD:EE:FF');
      }
    }
  });

  it('does not emit DEVICE_AUTHENTICATED_POLL_RESULT when poll service fails', async () => {
    const loggedMessages: string[] = [];
    const controller = new DeviceFirmwareController(
      {
        poll: async () => {
          throw new Error('synthetic poll service failure');
        },
      } as never,
      {} as never
    );

    const logSpy = spyOn(
      (controller as unknown as { logger: { log: (msg: string) => void } }).logger,
      'log'
    ).mockImplementation((msg: string) => {
      loggedMessages.push(msg);
    });

    await expect(
      controller.poll({ deviceId: 'device-1', mac: 'AA:BB:CC:DD:EE:FF' }, {
        telemetry: undefined,
      } as never)
    ).rejects.toThrow('synthetic poll service failure');

    expect(loggedMessages.some((msg) => msg.includes('DEVICE_AUTHENTICATED_POLL_RESULT'))).toBe(
      false
    );
    expect(logSpy).not.toHaveBeenCalledWith('DEVICE_AUTHENTICATED_POLL_RESULT=PASS');
  });

  it('protects the poll endpoint with DeviceAuthGuard', () => {
    const guards = Reflect.getMetadata('__guards__', DeviceFirmwareController.prototype.poll);
    expect(guards).toBeDefined();
    expect(guards).toContain(DeviceAuthGuard);
  });
});
