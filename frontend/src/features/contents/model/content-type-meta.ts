import { Image as ImageIcon } from 'lucide-react';
import type { DynamicTypeT } from 'shared';
import {
  DYNAMIC_TYPE_META,
  DYNAMIC_TYPE_ORDER,
  type DynamicTypeMeta,
} from '@/features/dynamic/model/type-meta';

export type AllContentType = 'image' | DynamicTypeT;

type TypeMeta = DynamicTypeMeta;

const DYNAMIC_CONTENT_TYPE_META = Object.fromEntries(
  DYNAMIC_TYPE_ORDER.map((type) => [type, DYNAMIC_TYPE_META[type]])
) as Record<DynamicTypeT, TypeMeta>;

export const TYPE_META: Record<AllContentType, TypeMeta> = {
  image: {
    label: 'Image',
    hint: 'Upload an image, converted to 1bpp',
    description:
      'Upload an image and configure dithering or thresholding; audio or TTS can be attached.',
    hasConfigurableParams: true,
    supportsAudio: true,
    Icon: ImageIcon,
  },
  ...DYNAMIC_CONTENT_TYPE_META,
};

const TYPE_ORDER = ['image', ...DYNAMIC_TYPE_ORDER] as const satisfies readonly AllContentType[];

export const TYPE_ITEMS = TYPE_ORDER.map((type) => ({
  type,
  title: TYPE_META[type].label,
  hint: TYPE_META[type].hint,
  Icon: TYPE_META[type].Icon,
}));
