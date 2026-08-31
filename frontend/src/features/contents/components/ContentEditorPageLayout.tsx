import { useCallback, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ContentDetailT } from 'shared';
import { useContentDetail } from '@/features/contents/query/content-read-queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequireRouteParams } from '@/components/layout/RequireRouteParams';
import { Spinner } from '@/components/ui/Spinner';
import { appRoutes } from '@/app/routes';

interface ContentEditorPageLayoutProps {
  missingContentHint: string;
  notFoundTitle: string;
  findContent: (content: ContentDetailT) => boolean;
  renderEditor: (props: { gid: string; content: ContentDetailT; onDone: () => void }) => ReactNode;
}

export function ContentEditorPageLayout({
  missingContentHint,
  notFoundTitle,
  findContent,
  renderEditor,
}: ContentEditorPageLayoutProps) {
  return (
    <RequireRouteParams
      names={['gid'] as const}
      hint="Open a content group from the overview page."
    >
      {({ gid }) => (
        <ContentEditorPageContent
          gid={gid}
          missingContentHint={missingContentHint}
          notFoundTitle={notFoundTitle}
          findContent={findContent}
          renderEditor={renderEditor}
        />
      )}
    </RequireRouteParams>
  );
}

function ContentEditorPageContent({
  gid,
  missingContentHint,
  notFoundTitle,
  findContent,
  renderEditor,
}: ContentEditorPageLayoutProps & { gid: string }) {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const content = useContentDetail(contentId);

  const onDone = useCallback(() => {
    navigate(appRoutes.group(gid));
  }, [gid, navigate]);

  if (!contentId) {
    return <EmptyState title="Page not found" hint={missingContentHint} />;
  }

  if (content.isPending) {
    return (
      <div className="pt-16 text-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  if (content.isError) {
    return <EmptyState title="Failed to load" hint="Refresh and try again." />;
  }

  const isExpectedContent = content.data ? findContent(content.data) : false;

  if (content.data && content.data.id !== contentId) {
    return (
      <EmptyState
        title="Failed to load"
        hint="Content details returned a mismatched ID. Refresh and try again."
      />
    );
  }

  if (!content.data || !isExpectedContent || content.data.group_id !== gid) {
    if (content.isFetching) {
      return (
        <div className="pt-16 text-center">
          <Spinner label="Loading" />
        </div>
      );
    }
    return <EmptyState title={notFoundTitle} />;
  }

  return <>{renderEditor({ gid, content: content.data, onDone })}</>;
}
