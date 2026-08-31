// 图片内容编辑页面 — 将路由参数解析后传入编辑器。

import { ImageContentEditor } from '@/features/contents/components/image-form/ImageContentEditor';
import { ContentEditorPageLayout } from '@/features/contents/components/ContentEditorPageLayout';

export function ImageContentEditorPage() {
  return (
    <ContentEditorPageLayout
      missingContentHint="Open image content from the content list."
      notFoundTitle="Content not found or deleted"
      findContent={(content) => content.kind === 'image'}
      renderEditor={({ gid, content, onDone }) => (
        <ImageContentEditor gid={gid} content={content} onDone={onDone} />
      )}
    />
  );
}
