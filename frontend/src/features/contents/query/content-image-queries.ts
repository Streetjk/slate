import type { ImageEditSourceT } from 'shared';
import { useQuery } from '@tanstack/react-query';
import { API_PREFIX, api } from '@/lib/http';
import { contentKeys } from './keys';

export function useContentImage(contentId: string, etag: string | null | undefined) {
  return useQuery({
    queryKey: contentKeys.image(contentId, etag),
    queryFn: async () => {
      const { data } = await api.get<ArrayBuffer>(`${API_PREFIX}/contents/${contentId}/image`, {
        responseType: 'arraybuffer',
      });
      return data;
    },
    staleTime: Infinity,
    enabled: !!contentId && !!etag,
  });
}

export function useContentImageSource(contentId: string) {
  return useQuery({
    queryKey: ['content-image-source', contentId],
    queryFn: async () => {
      const { data } = await api.get<ImageEditSourceT | null>(
        `${API_PREFIX}/contents/${contentId}/image-source`
      );
      return data;
    },
    staleTime: Infinity,
    enabled: !!contentId,
  });
}
