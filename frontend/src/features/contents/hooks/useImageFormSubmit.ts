import { useCallback } from 'react';
import { FRAME_WIDTH, FRAME_HEIGHT, type DitherMode } from 'shared';
import { drawImagePreview } from '@/lib/eink/image-preview';

export function useImageFormSubmit({
  imageFile,
  audioFile,
  previewRef,
  hasDitherPatch,
  scale,
  offset,
  frameName,
  threshold,
  mode,
}: {
  imageFile: File | null;
  hasDitherPatch: boolean;
  scale: number;
  offset: { x: number; y: number };
  audioFile: File | null;
  previewRef: React.RefObject<HTMLCanvasElement | null>;
  frameName: string;
  threshold: number;
  mode: DitherMode;
}) {
  return useCallback(async (): Promise<FormData> => {
    const fd = new FormData();
    if (imageFile) {
      const canvas = previewRef.current;
      if (!canvas) {
        throw new Error('The preview canvas is not ready. Try again shortly.');
      }
      const blob = await exportSourceBlob(imageFile, scale, offset);
      fd.append('image', blob, 'cropped.png');
    }
    if (imageFile || hasDitherPatch) {
      fd.append('threshold', String(threshold));
      fd.append('mode', mode);
    }
    if (audioFile) fd.append('audio', audioFile);
    fd.append('frame_name', frameName.trim());
    return fd;
  }, [audioFile, frameName, imageFile, hasDitherPatch, mode, previewRef, threshold, scale, offset]);
}

function exportCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas export failed'))),
      'image/png'
    );
  });
}

async function exportSourceBlob(
  file: File,
  scale: number,
  offset: { x: number; y: number }
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image canvas unavailable');
    drawImagePreview(ctx, canvas, image, {
      scale,
      offset,
      threshold: 128,
      mode: 'threshold',
      dither: false,
    });
    return await exportCanvasBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}
