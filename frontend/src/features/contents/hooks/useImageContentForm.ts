import { useCallback, useMemo, useRef, useState } from 'react';
import {
  BW_THRESHOLD_DEFAULT,
  DEFAULT_DITHER_MODE,
  type ContentDetailT,
  type DitherMode,
  type ImageEditSourceT,
} from 'shared';
import { useAudioFormState } from './useAudioFormState';
import { useCropState } from './useCropState';
import { useImageFormSubmit } from './useImageFormSubmit';

export function useImageContentForm(content?: ContentDetailT, source?: ImageEditSourceT | null) {
  const isEdit = !!content;
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const sourceFile = useMemo(
    () =>
      source
        ? new File(
            [Uint8Array.from(atob(source.image_base64), (c) => c.charCodeAt(0))],
            'saved-source',
            { type: source.mime }
          )
        : null,
    [source]
  );
  const imageFile = imageFiles[0] ?? sourceFile;
  const audio = useAudioFormState(content);
  const [threshold, setThreshold] = useState(source?.threshold ?? BW_THRESHOLD_DEFAULT);
  const [mode, setMode] = useState<DitherMode>(source?.mode ?? DEFAULT_DITHER_MODE);
  const [frameName, setFrameName] = useState(content?.frame_name ?? '');
  const { scale, setScale, offset, setOffset, resetCrop } = useCropState();
  const frameNameChanged = isEdit && frameName !== (content.frame_name ?? '');
  const trimmedTtsText = audio.ttsText.trim();
  const existingTtsText = content?.audio_text?.trim() ?? '';
  const hasExistingTts = isEdit && content?.audio_source === 'tts';
  const wantsTts =
    audio.audioMode === 'tts' &&
    trimmedTtsText.length > 0 &&
    (!hasExistingTts ||
      content?.audio_status === 'failed' ||
      trimmedTtsText !== existingTtsText ||
      audio.ttsVoice !== content?.audio_voice);
  const cropChanged = scale !== 1 || offset.x !== 0 || offset.y !== 0;
  const ditherChanged = !!source && (mode !== source.mode || threshold !== source.threshold);
  const hasImageUpload = imageFiles.length > 0 || (!!sourceFile && cropChanged);
  const hasDitherPatch = !!sourceFile && ditherChanged && !hasImageUpload;
  const hasFilePatch = hasImageUpload || hasDitherPatch || !!audio.audioFile;
  const hasContentPatch = hasFilePatch || frameNameChanged;
  const canCreate = !!imageFile && (audio.audioMode !== 'tts' || trimmedTtsText.length > 0);
  const canEdit =
    (hasContentPatch || wantsTts) && (audio.audioMode !== 'tts' || trimmedTtsText.length > 0);

  const onImagePick = useCallback(
    (file: File | null) => {
      setImageFiles(file ? [file] : []);
      resetCrop();
    },
    [resetCrop]
  );

  const onImagePickMany = useCallback(
    (files: File[]) => {
      setImageFiles(files.slice(0, 24));
      resetCrop();
    },
    [resetCrop]
  );

  const reset = useCallback(() => {
    setImageFiles([]);
    audio.resetAudio();
    setThreshold(BW_THRESHOLD_DEFAULT);
    setMode(DEFAULT_DITHER_MODE);
    setFrameName('');
    resetCrop();
  }, [audio, resetCrop]);

  const buildFormData = useImageFormSubmit({
    imageFile: hasImageUpload ? imageFile : null,
    hasDitherPatch,
    scale,
    offset,
    audioFile: audio.audioFile,
    previewRef,
    frameName,
    threshold,
    mode,
  });

  return {
    image: {
      previewRef,
      file: imageFile,
      files: imageFiles,
      setFile: (file: File | null) => setImageFiles(file ? [file] : []),
      onPick: onImagePick,
      onPickMany: onImagePickMany,
    },
    audio: {
      file: audio.audioFile,
      setFile: audio.setAudioFile,
      mode: audio.audioMode,
      setMode: audio.setAudioMode,
      ttsText: audio.ttsText,
      setTtsText: audio.setTtsText,
      ttsVoice: audio.ttsVoice,
      setTtsVoice: audio.setTtsVoice,
      trimmedTtsText,
      wantsTts,
    },
    dither: {
      threshold,
      setThreshold,
      mode,
      setMode,
    },
    crop: {
      scale,
      setScale,
      offset,
      setOffset,
      reset: resetCrop,
    },
    frameName,
    setFrameName,
    frameNameChanged,
    hasContentPatch,
    hasFilePatch,
    canCreate,
    canEdit,
    reset,
    buildFormData,
  };
}
