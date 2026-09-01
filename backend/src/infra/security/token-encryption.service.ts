import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppConfig } from '../config/app.config';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

@Injectable()
export class TokenEncryptionService {
  constructor(private readonly config: AppConfig) {}

  encrypt(plaintext: string, associatedData: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key(), iv);
    cipher.setAAD(Buffer.from(associatedData, 'utf8'));
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return ['v1', this.encode(iv), this.encode(cipher.getAuthTag()), this.encode(ciphertext)].join(
      ':'
    );
  }

  decrypt(payload: string, associatedData: string): string {
    const [version, encodedIv, encodedTag, encodedCiphertext] = payload.split(':');
    if (version !== 'v1' || !encodedIv || !encodedTag || !encodedCiphertext) {
      throw new Error('Unsupported encrypted token payload');
    }
    const iv = this.decode(encodedIv);
    const tag = this.decode(encodedTag);
    if (iv.byteLength !== IV_BYTES || tag.byteLength !== TAG_BYTES) {
      throw new Error('Invalid encrypted token payload');
    }
    const decipher = createDecipheriv(ALGORITHM, this.key(), iv);
    decipher.setAAD(Buffer.from(associatedData, 'utf8'));
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(this.decode(encodedCiphertext)),
      decipher.final(),
    ]).toString('utf8');
  }

  private key(): Buffer {
    const value = this.config.tokenEncryptionKey;
    if (!value) throw new Error('TOKEN_ENCRYPTION_KEY is required for external integrations');
    if (/^[0-9a-f]{64}$/i.test(value)) return Buffer.from(value, 'hex');
    const key = Buffer.from(value, 'base64');
    if (key.byteLength !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
    return key;
  }

  private encode(value: Buffer): string {
    return value.toString('base64url');
  }

  private decode(value: string): Buffer {
    return Buffer.from(value, 'base64url');
  }
}
