import {
  API_DEFAULT_DITHER_MODE,
  BW_THRESHOLD_DEFAULT,
  ImageEditSource,
  type ImageEditSourceT,
} from 'shared';
import type { ParsedContentUpload } from './multipart-parser';

export function encodeImageSource(parsed: ParsedContentUpload): Buffer {
  if (!parsed.imageBuf) throw new Error('Image source is required');
  return Buffer.from(
    JSON.stringify({
      image_base64: parsed.imageBuf.toString('base64'),
      mime: parsed.imageMime ?? 'image/png',
      mode: parsed.mode ?? API_DEFAULT_DITHER_MODE,
      threshold: parsed.threshold ?? BW_THRESHOLD_DEFAULT,
    })
  );
}
export function decodeImageSource(bytes: Buffer): ImageEditSourceT {
  return ImageEditSource.parse(JSON.parse(bytes.toString('utf8')));
}
