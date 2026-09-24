import { useState, type FormEvent, type ReactNode } from 'react';
import { useToast } from '@/components/feedback/toast-context';
import { FormActions } from '@/components/ui/FormActions';
import { ImageFormBody } from '@/features/contents/components/image-form/ImageFormBody';
import { useGenerateContentTts } from '@/features/contents/query/content-audio-queries';
import { useCreateImageContent } from '@/features/contents/query/content-mutation-queries';
import { useImageContentForm } from '@/features/contents/hooks/useImageContentForm';
import { getApiErrorMessage } from '@/lib/api-errors';

interface ImageCreateFormProps {
  gid: string;
  header?: ReactNode;
  onDone: () => void;
  onEditCreatedImage?: (contentId: string) => void;
}

export function ImageCreateForm({ gid, header, onDone, onEditCreatedImage }: ImageCreateFormProps) {
  const createImage = useCreateImageContent(gid);
  const generateTts = useGenerateContentTts(gid);
  const toast = useToast();
  const form = useImageContentForm();
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const galleryMode = form.image.files.length > 1;
  const submitting = createImage.isPending || generateTts.isPending || bulkSubmitting;

  async function submitContent() {
    if (!form.image.file) return;
    if (galleryMode) {
      await submitGallery();
      return;
    }

    try {
      const fd = await form.buildFormData();
      const created = await createImage.mutateAsync(fd);
      if (form.audio.wantsTts) {
        try {
          await generateTts.mutateAsync({
            contentId: created.id,
            body: { text: form.audio.trimmedTtsText, voice: form.audio.ttsVoice },
          });
        } catch (err) {
          toast.error('Content created, but TTS generation failed', getApiErrorMessage(err));
          if (onEditCreatedImage) onEditCreatedImage(created.id);
          else onDone();
          return;
        }
      }
      toast.success('Content created');
      onDone();
    } catch (err) {
      toast.error('Create failed', getApiErrorMessage(err));
    }
  }

  async function submitGallery() {
    setBulkSubmitting(true);
    let created = 0;
    let failed = 0;
    const baseName = form.frameName.trim();
    try {
      for (let index = 0; index < form.image.files.length; index++) {
        const file = form.image.files[index]!;
        const fd = new FormData();
        fd.append('image', file, file.name);
        fd.append('threshold', String(form.dither.threshold));
        fd.append('mode', form.dither.mode);
        const fileName = file.name.replace(/\.[^.]+$/, '').trim() || `Photo ${index + 1}`;
        const frameName = baseName
          ? `${baseName} ${index + 1}`.slice(0, 64)
          : fileName.slice(0, 64);
        fd.append('frame_name', frameName);
        try {
          await createImage.mutateAsync(fd);
          created += 1;
        } catch {
          failed += 1;
        }
      }
    } finally {
      setBulkSubmitting(false);
    }

    if (created > 0) {
      toast.success(`${created} photo${created === 1 ? '' : 's'} added to gallery`);
    }
    if (failed > 0) {
      toast.error(`${failed} photo${failed === 1 ? '' : 's'} failed to upload`);
    }
    if (created > 0) onDone();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitContent();
  }

  return (
    <form onSubmit={onSubmit}>
      <ImageFormBody
        gid={gid}
        form={form}
        isEdit={false}
        gridClassName="lg:grid-cols-2"
        beforeFields={header}
        actions={
          <FormActions
            onCancel={onDone}
            submitLabel={galleryMode ? `Create gallery (${form.image.files.length})` : 'Create'}
            disabled={(galleryMode ? form.image.files.length === 0 : !form.canCreate) || submitting}
            submitting={submitting}
          />
        }
      />
    </form>
  );
}
