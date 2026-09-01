import { describe, expect, it } from 'bun:test';
import { TokenEncryptionService } from './token-encryption.service';

describe('TokenEncryptionService', () => {
  it('round-trips with authenticated associated data', () => {
    const service = new TokenEncryptionService({ tokenEncryptionKey: 'a'.repeat(64) } as never);
    const payload = service.encrypt('refresh-token-value', 'user-1:microsoft:cache');

    expect(payload).toMatch(/^v1:[^:]+:[^:]+:[^:]+$/);
    expect(service.decrypt(payload, 'user-1:microsoft:cache')).toBe('refresh-token-value');
    expect(() => service.decrypt(payload, 'user-2:microsoft:cache')).toThrow();
  });

  it('rejects missing encryption configuration', () => {
    const service = new TokenEncryptionService({ tokenEncryptionKey: undefined } as never);
    expect(() => service.encrypt('secret', 'context')).toThrow('TOKEN_ENCRYPTION_KEY');
  });
});
