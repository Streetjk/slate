import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/lib/format';

interface ImageDropzoneProps {
  isEdit: boolean;
  imageFile: File | null;
  imageFiles?: File[];
  onPick: (f: File | null) => void;
  onPickMany?: (files: File[]) => void;
  allowMultiple?: boolean;
}

export function ImageDropzone({
  isEdit,
  imageFile,
  imageFiles = imageFile ? [imageFile] : [],
  onPick,
  onPickMany,
  allowMultiple = false,
}: ImageDropzoneProps) {
  const dz = useDropzone({
    onDrop: (files) => {
      if (allowMultiple && onPickMany) {
        const combined = [...imageFiles, ...files].filter(
          (file, index, all) =>
            all.findIndex(
              (candidate) =>
                candidate.name === file.name &&
                candidate.size === file.size &&
                candidate.lastModified === file.lastModified
            ) === index
        );
        onPickMany(combined.slice(0, 24));
      } else {
        onPick(files[0] ?? null);
      }
    },
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'] },
    maxFiles: allowMultiple ? 24 : 1,
    multiple: allowMultiple,
  });

  function removeFile(index: number) {
    if (!allowMultiple || !onPickMany) {
      onPick(null);
      return;
    }
    onPickMany(imageFiles.filter((_, candidateIndex) => candidateIndex !== index));
  }

  const hasGallery = allowMultiple && imageFiles.length > 0;

  return (
    <div className="space-y-3">
      <div
        {...dz.getRootProps()}
        className={cn(
          'border border-dashed transition-colors px-5 py-6 text-center cursor-pointer',
          dz.isDragActive ? 'border-ink bg-cream' : 'border-ink/50 hover:border-ink hover:bg-cream'
        )}
      >
        <input {...dz.getInputProps()} />
        <ImagePlus
          size={20}
          className={cn(
            'mx-auto mb-2 transition-colors',
            imageFiles.length > 0 ? 'text-ink' : 'text-stone-light'
          )}
        />
        {hasGallery ? (
          <>
            <p className="font-serif text-[14px] text-ink">
              {imageFiles.length} photo{imageFiles.length === 1 ? '' : 's'} selected
            </p>
            <p className="font-sans text-[11px] text-stone mt-0.5">
              Click or drop more photos · up to 24 per gallery batch
            </p>
          </>
        ) : imageFile ? (
          <>
            <p className="font-serif text-[14px] text-ink truncate">{imageFile.name}</p>
            <p className="font-sans text-[11px] text-stone mt-0.5">
              {formatBytes(imageFile.size)} · Click to replace image
            </p>
          </>
        ) : isEdit ? (
          <p className="font-sans text-[13px] text-stone">
            Drop an image to replace the current one, or leave empty to keep it
          </p>
        ) : (
          <>
            <p className="font-sans text-[13px] text-stone">
              Drop photos here or click to choose multiple photos
            </p>
            <p className="font-sans text-[11px] text-stone-light mt-0.5">
              PNG / JPG / WEBP / GIF / BMP · multi-select supported
            </p>
          </>
        )}
      </div>

      {hasGallery && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {imageFiles.map((file, index) => (
            <GalleryThumb
              key={`${file.name}:${file.size}:${file.lastModified}:${index}`}
              file={file}
              index={index}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryThumb({ file, index, onRemove }: { file: File; index: number; onRemove: () => void }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return (
    <div className="relative border border-line bg-cream overflow-hidden aspect-[4/3]">
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" />}
      <div className="absolute left-1 bottom-1 bg-paper/90 px-1.5 py-0.5 font-mono text-[9px] text-ink">
        {index + 1}
      </div>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 bg-paper/90 border border-ink/30 p-1 hover:bg-paper"
      >
        <X size={12} />
      </button>
    </div>
  );
}
