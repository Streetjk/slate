// 动态内容编辑页 —— create + edit 共用。
//
// 路由：
//   /groups/:gid/contents/dynamic/:contentId/edit — 编辑

import { DynamicContentEditor } from '@/features/dynamic/components/DynamicContentEditor';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ContentEditorPageLayout } from '@/features/contents/components/ContentEditorPageLayout';

export function DynamicContentEditorPage() {
  return (
    <ContentEditorPageLayout
      missingContentHint="Open dynamic content from the content list."
      notFoundTitle="Dynamic content not found or deleted"
      findContent={(content) => content.kind === 'dynamic'}
      renderEditor={({ gid, content, onDone }) => {
        if (!content.dynamic_type || !content.dynamic_config) {
          return (
            <EmptyState
              title="Dynamic content configuration missing"
              hint="This dynamic content is incomplete. Return to the content list and try again."
              action={
                <Button variant="outline" size="sm" onClick={onDone}>
                  Back
                </Button>
              }
            />
          );
        }

        // ContentDetail 已经带 dynamic_type / dynamic_config，省一次 GET /contents/:id 请求。
        return (
          <DynamicContentEditor
            gid={gid}
            content={content}
            initialType={content.dynamic_type}
            initialConfig={content.dynamic_config}
            onDone={onDone}
          />
        );
      }}
    />
  );
}
