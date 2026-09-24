import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ImagePlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ContentDetailT } from 'shared';
import { useGenerateContentTts } from '@/features/contents/query/content-audio-queries';
import { useContentImage } from '@/features/contents/query/content-image-queries';
import { useGroupContents } from '@/features/contents/query/content-read-queries';
import {
  useCreateImageContent,
  useDeleteContent,
  usePatchContentFrameName,
  useReorderContents,
  useUpdateImageContent,
} from '@/features/contents/query/content-mutation-queries';
import { useToast } from '@/components/feedback/toast-context';
import { FormActions } from '@/components/ui/FormActions';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FrameBitmapPreview } from '@/components/eink/FrameBitmapPreview';
import { TYPE_META } from '@/features/contents/model/content-type-meta';
import { getApiErrorMessage } from '@/lib/api-errors';
import { appRoutes } from '@/app/routes';
import { useImageContentForm } from '@/features/contents/hooks/useImageContentForm';
import { ImageFormBody } from './ImageFormBody';

interface ImageContentEditorProps {
  gid: string;
  content: ContentDetailT;
  onDone: () => void;
}

export function ImageContentEditor({ gid, content, onDone }: ImageContentEditorProps) {
  const navigate = useNavigate();
  const updateImageContent = useUpdateImageContent(gid);
  const patchFrameName = usePatchContentFrameName(gid);
  const generateTts = useGenerateContentTts(gid);
  const createImage = useCreateImageContent(gid);
  const deleteContent = useDeleteContent(gid);
  const reorderContents = useReorderContents(gid);
  const contents = useGroupContents(gid);
  const toast = useToast();
  const form = useImageContentForm(content);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const photos = (contents.data ?? [])
    .filter((item): item is ContentDetailT => item.kind === 'image')
    .sort((a, b) => a.seq - b.seq);

  const submitting =
    updateImageContent.isPending ||
    patchFrameName.isPending ||
    generateTts.isPending ||
    bulkUploading;

  const existingImg = useContentImage(content.id, !form.image.file ? content.image_etag : null);
  const canSubmit = form.canEdit;

  async function submitContent() {
    try {
      if (form.hasFilePatch) {
        const fd = await form.buildFormData();
        await updateImageContent.mutateAsync({ contentId: content.id, form: fd });
      } else if (form.frameNameChanged) {
        await patchFrameName.mutateAsync({
          contentId: content.id,
          frameName: form.frameName.trim() || null,
        });
      }
      if (form.audio.wantsTts) {
        try {
          await generateTts.mutateAsync({
            contentId: content.id,
            body: { text: form.audio.trimmedTtsText, voice: form.audio.ttsVoice },
          });
        } catch (err) {
          const title = form.hasContentPatch
            ? 'Content saved, but TTS generation failed'
            : 'TTS generation failed';
          toast.error(title, `${getApiErrorMessage(err)} Adjust the TTS text and save again.`);
          return;
        }
      }
      toast.success('Photo saved');
    } catch (err) {
      toast.error('Save failed', getApiErrorMessage(err));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitContent();
  }

  async function onPhotosSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 24);
    event.target.value = '';
    if (files.length === 0) return;

    setBulkUploading(true);
    let created = 0;
    let failed = 0;
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file, file.name);
        fd.append('frame_name', file.name.replace(/\.[^.]+$/, '').slice(0, 64));
        fd.append('mode', 'floyd');
        try {
          await createImage.mutateAsync(fd);
          created += 1;
        } catch {
          failed += 1;
        }
      }
    } finally {
      setBulkUploading(false);
    }

    if (created > 0) toast.success(`${created} photo${created === 1 ? '' : 's'} added to gallery`);
    if (failed > 0) toast.error(`${failed} photo${failed === 1 ? '' : 's'} failed to upload`);
  }

  async function removePhoto(photo: ContentDetailT) {
    const name = photo.frame_name || `Photo ${photo.seq + 1}`;
    if (!window.confirm(`Remove "${name}" from the gallery?`)) return;

    const remaining = photos.filter((candidate) => candidate.id !== photo.id);
    try {
      await deleteContent.mutateAsync(photo.id);
      toast.success('Photo removed');
      if (photo.id === content.id) {
        const next = remaining[0];
        if (next) navigate(appRoutes.editImageContent(gid, next.id), { replace: true });
        else navigate(appRoutes.group(gid), { replace: true });
      }
    } catch (err) {
      toast.error('Remove failed', getApiErrorMessage(err));
    }
  }

  async function movePhoto(photoId: string, direction: -1 | 1) {
    const all = [...(contents.data ?? [])].sort((a, b) => a.seq - b.seq);
    const photoIds = all.filter((item) => item.kind === 'image').map((item) => item.id);
    const current = photoIds.indexOf(photoId);
    const target = current + direction;
    if (current < 0 || target < 0 || target >= photoIds.length) return;

    const nextPhotoIds = [...photoIds];
    [nextPhotoIds[current], nextPhotoIds[target]] = [nextPhotoIds[target]!, nextPhotoIds[current]!];
    let photoCursor = 0;
    const order = all.map((item) =>
      item.kind === 'image' ? nextPhotoIds[photoCursor++]! : item.id
    );

    try {
      await reorderContents.mutateAsync({ order });
      toast.success('Gallery order updated');
    } catch (err) {
      toast.error('Reorder failed', getApiErrorMessage(err));
    }
  }

  return (
    <div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
        multiple
        className="hidden"
        onChange={onPhotosSelected}
      />

      <PageHeader
        onBack={onDone}
        icon={<ImageIcon size={24} />}
        title="Photo gallery"
        subtitle={`${photos.length} photo${photos.length === 1 ? '' : 's'} · Volume Up/Down and auto-rotate use this gallery`}
        action={
          <Button
            size="sm"
            iconLeft={<ImagePlus size={15} />}
            onClick={() => photoInputRef.current?.click()}
            disabled={bulkUploading}
          >
            Add photos
          </Button>
        }
      />

      <section className="mt-5 border-y border-line py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
              Gallery · {photos.length}
            </p>
            <p className="mt-1 font-serif text-[12px] text-stone-light">
              Select a thumbnail to edit that photo. New uploads can contain multiple images.
            </p>
          </div>
        </div>

        {contents.isPending ? (
          <p className="font-serif italic text-[12px] text-stone-light">Loading gallery…</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {photos.map((photo, index) => (
              <GalleryPhotoThumb
                key={photo.id}
                photo={photo}
                index={index}
                selected={photo.id === content.id}
                canMoveLeft={index > 0}
                canMoveRight={index < photos.length - 1}
                reordering={reorderContents.isPending}
                onSelect={() => navigate(appRoutes.editImageContent(gid, photo.id))}
                onMoveLeft={() => void movePhoto(photo.id, -1)}
                onMoveRight={() => void movePhoto(photo.id, 1)}
                onRemove={() => void removePhoto(photo)}
              />
            ))}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex aspect-[4/3] min-h-24 flex-col items-center justify-center border border-dashed border-ink/40 bg-cream/40 px-3 text-center transition-colors hover:border-ink hover:bg-cream"
            >
              <ImagePlus size={18} className="mb-2 text-stone" />
              <span className="font-sans text-[11px] text-stone">Add more photos</span>
            </button>
          </div>
        )}
      </section>

      <div className="mt-6 fade-up fade-up-1">
        <form onSubmit={onSubmit}>
          <ImageFormBody
            gid={gid}
            form={form}
            isEdit
            existingImage={existingImg.data}
            existingImagePending={existingImg.isPending && !form.image.file}
            hasExistingAudio={!!content.audio_etag}
            editingContentId={content.id}
            audioStatus={content.audio_status}
            audioError={content.audio_error}
            beforeFields={
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
                    Selected photo · {Math.max(1, photos.findIndex((p) => p.id === content.id) + 1)} / {Math.max(1, photos.length)}
                  </p>
                  <p className="mt-1 font-sans text-[12px] text-stone leading-relaxed">
                    {TYPE_META.image.description}
                  </p>
                </div>
                <div className="border-t border-line" />
              </div>
            }
            actions={
              <FormActions
                onCancel={onDone}
                submitLabel="Save selected photo"
                disabled={!canSubmit}
                submitting={submitting}
              />
            }
          />
        </form>
      </div>
    </div>
  );
}

function GalleryPhotoThumb({
  photo,
  index,
  selected,
  canMoveLeft,
  canMoveRight,
  reordering,
  onSelect,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: {
  photo: ContentDetailT;
  index: number;
  selected: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  reordering: boolean;
  onSelect: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
}) {
  const image = useContentImage(photo.id, photo.image_etag);

  return (
    <div
      className={`group relative aspect-[4/3] overflow-hidden border bg-paper ${
        selected ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink/60'
      }`}
    >
      <button type="button" onClick={onSelect} className="absolute inset-0 z-0 w-full">
        <FrameBitmapPreview data={image.data} showStatusBar={false} />
      </button>
      <span className="pointer-events-none absolute bottom-1 left-1 z-10 bg-paper/90 px-1.5 py-0.5 font-mono text-[9px] text-ink">
        {index + 1}
      </span>
      <div className="absolute bottom-1 right-1 z-20 flex gap-1 opacity-80 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onMoveLeft}
          disabled={!canMoveLeft || reordering}
          aria-label="Move photo earlier"
          title="Move earlier"
          className="border border-ink/30 bg-paper/90 p-1 text-stone hover:text-ink disabled:opacity-30"
        >
          <ChevronLeft size={12} />
        </button>
        <button
          type="button"
          onClick={onMoveRight}
          disabled={!canMoveRight || reordering}
          aria-label="Move photo later"
          title="Move later"
          className="border border-ink/30 bg-paper/90 p-1 text-stone hover:text-ink disabled:opacity-30"
        >
          <ChevronRight size={12} />
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${photo.frame_name || `photo ${index + 1}`}`}
        title="Remove photo"
        className="absolute right-1 top-1 z-20 border border-ink/30 bg-paper/90 p-1 text-stone opacity-80 transition-opacity hover:text-clay group-hover:opacity-100"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
