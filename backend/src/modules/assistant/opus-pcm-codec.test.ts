import { describe, expect, it } from 'bun:test';
import { OpusPcmCodec, resamplePcm16 } from './opus-pcm-codec';

describe('resamplePcm16', () => {
  it('converts complete samples and keeps the requested rate ratio', () => {
    const input = Buffer.alloc(4 * 2);
    input.writeInt16LE(-1000, 0);
    input.writeInt16LE(1000, 2);
    input.writeInt16LE(-2000, 4);
    input.writeInt16LE(2000, 6);

    const output = resamplePcm16(input, 24_000, 16_000);

    expect(output.byteLength).toBe(4);
    expect(output.readInt16LE(0)).toBe(-1000);
    expect(output.readInt16LE(2)).toBe(1000);
  });

  it('rejects odd PCM payloads', () => {
    expect(() => resamplePcm16(new Uint8Array([1]), 24_000, 16_000)).toThrow('complete samples');
  });

  it('accepts a complete PCM view with an unaligned byte offset', () => {
    const source = new Uint8Array(10);
    const view = source.subarray(1, 9);
    expect(() => resamplePcm16(view, 24_000, 16_000)).not.toThrow();
  });
});

describe('OpusPcmCodec', () => {
  it('decodes device Opus and emits 60 ms encoded frames for model PCM', () => {
    const codec = new OpusPcmCodec();
    try {
      const packet = codec.encodeModelPcm(Buffer.alloc(2_880));
      expect(packet).toHaveLength(1);
      expect(codec.decodeDevicePacket(packet[0]!)).toHaveLength(1_920);
    } finally {
      codec.close();
    }
  });

  it('releases codec resources and rejects use after close', () => {
    const codec = new OpusPcmCodec();
    codec.close();
    expect(() => codec.decodeDevicePacket(new Uint8Array([1]))).toThrow('codec is closed');
    expect(() => codec.close()).not.toThrow();
  });

  it('resets a partial output frame between turns', () => {
    const codec = new OpusPcmCodec();
    try {
      expect(codec.encodeModelPcm(Buffer.alloc(1_000))).toHaveLength(0);
      codec.reset();
      expect(codec.encodeModelPcm(Buffer.alloc(2_880))).toHaveLength(1);
    } finally {
      codec.close();
    }
  });
});
