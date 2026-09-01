import OpusScript from 'opusscript';

const DEVICE_SAMPLE_RATE = 16_000;
const MODEL_SAMPLE_RATE = 24_000;
const CHANNELS = 1;
const FRAME_DURATION_MS = 60;
const FRAME_SAMPLES = (DEVICE_SAMPLE_RATE * FRAME_DURATION_MS) / 1000;
const FRAME_BYTES = FRAME_SAMPLES * 2;

export interface VoiceCodec {
  decodeDevicePacket(packet: Uint8Array): Uint8Array;
  encodeModelPcm(pcm24: Uint8Array): Uint8Array[];
  close(): void;
}

export class OpusPcmCodec implements VoiceCodec {
  private readonly decoder = new OpusScript(
    DEVICE_SAMPLE_RATE,
    CHANNELS,
    OpusScript.Application.VOIP
  );
  private readonly encoder = new OpusScript(
    DEVICE_SAMPLE_RATE,
    CHANNELS,
    OpusScript.Application.VOIP
  );
  private pendingPcm16 = Buffer.alloc(0);
  private closed = false;

  decodeDevicePacket(packet: Uint8Array): Uint8Array {
    this.assertOpen();
    if (packet.byteLength === 0) throw new Error('empty Opus packet');
    return this.decoder.decode(Buffer.from(packet));
  }

  encodeModelPcm(pcm24: Uint8Array): Uint8Array[] {
    this.assertOpen();
    if (pcm24.byteLength % 2 !== 0) throw new Error('model PCM must contain complete samples');
    const pcm16 = resamplePcm16(pcm24, MODEL_SAMPLE_RATE, DEVICE_SAMPLE_RATE);
    this.pendingPcm16 = Buffer.concat([this.pendingPcm16, pcm16]);
    const packets: Uint8Array[] = [];
    while (this.pendingPcm16.byteLength >= FRAME_BYTES) {
      const frame = this.pendingPcm16.subarray(0, FRAME_BYTES);
      this.pendingPcm16 = this.pendingPcm16.subarray(FRAME_BYTES);
      packets.push(this.encoder.encode(frame, FRAME_SAMPLES));
    }
    return packets;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.pendingPcm16 = Buffer.alloc(0);
    this.decoder.delete();
    this.encoder.delete();
  }

  private assertOpen(): void {
    if (this.closed) throw new Error('voice codec is closed');
  }
}

export function resamplePcm16(pcm: Uint8Array, inputRate: number, outputRate: number): Buffer {
  if (pcm.byteLength % 2 !== 0) throw new Error('PCM must contain complete samples');
  if (inputRate <= 0 || outputRate <= 0) throw new Error('PCM sample rates must be positive');
  if (inputRate === outputRate) return Buffer.from(pcm);

  const input = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);
  const outputLength = Math.floor((input.length * outputRate) / inputRate);
  const output = Buffer.alloc(outputLength * 2);
  for (let index = 0; index < outputLength; index++) {
    const sourceIndex = Math.min(input.length - 1, Math.floor((index * inputRate) / outputRate));
    output.writeInt16LE(input[sourceIndex]!, index * 2);
  }
  return output;
}
