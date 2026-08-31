import { useCallback } from 'react';
import type { ContentSummaryT } from 'shared';
import { useConfirmAction } from '@/hooks/useMutationAction';
import { useDeleteContent } from '@/features/contents/query/content-mutation-queries';

export function useDeleteContentWithConfirm({
  gid,
  content,
  description,
}: {
  gid: string;
  content: Pick<ContentSummaryT, 'id' | 'seq' | 'frame_name' | 'audio_etag' | 'kind'>;
  description?: string;
}) {
  const { mutate, isPending } = useDeleteContent(gid);

  const confirmDelete = useConfirmAction<string>({
    isPending,
    getConfirmOptions: useCallback(
      () => ({
        title: `Delete item ${content.seq + 1}?`,
        description: description ?? defaultDeleteDescription(content),
        destructive: true,
        confirmText: 'Delete',
      }),
      [content, description]
    ),
    run: useCallback((contentId, callbacks) => mutate(contentId, callbacks), [mutate]),
    successToast: 'Deleted',
    errorToast: 'Delete failed',
  });
  const deleteWithConfirm = useCallback(() => {
    void confirmDelete(content.id);
  }, [confirmDelete, content.id]);

  return { deleteWithConfirm, isPending };
}

function defaultDeleteDescription(
  content: Pick<ContentSummaryT, 'frame_name' | 'audio_etag' | 'kind'>
): string {
  if (content.kind === 'dynamic') {
    return content.frame_name
      ? `Dynamic content “${content.frame_name}” will also be permanently deleted.`
      : 'This dynamic content will be permanently deleted.';
  }
  return content.frame_name
    ? `“${content.frame_name}” and its image${content.audio_etag ? ' and audio' : ''} will be permanently deleted.`
    : `This content's image${content.audio_etag ? ' and audio' : ''} will be permanently deleted.`;
}
