import { memo, useCallback, useState } from 'react';
import { FolderHeart, Plus } from 'lucide-react';
import type { GroupSummaryT } from 'shared';
import {
  useCreateGroup,
  useDeleteGroup,
  useReorderGroups,
} from '@/features/groups/query/group-queries';
import { CreateGroupDialog } from '@/features/groups/components/CreateGroupDialog';
import { GroupCardSortable } from '@/features/groups/components/GroupCard';
import { useConfirmAction } from '@/hooks/useMutationAction';
import { useToast } from '@/components/feedback/toast-context';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { SortableGrid } from '@/components/dnd/SortableGrid';
import { getApiErrorMessage } from '@/lib/api-errors';
import { useDndOrder } from '@/components/dnd/useDndOrder';

interface GroupsSectionProps {
  groups: GroupSummaryT[] | undefined;
  isPending: boolean;
}

export const GroupsSection = memo(function GroupsSection({
  groups,
  isPending,
}: GroupsSectionProps) {
  const create = useCreateGroup();
  const { mutate: deleteGroupMutate, isPending: deletePending } = useDeleteGroup();
  const reorder = useReorderGroups();
  const toast = useToast();
  const deleteGroup = useConfirmAction<GroupSummaryT>({
    isPending: deletePending,
    getConfirmOptions: useCallback(
      (group) => ({
        title: `Delete “${group.name}”?`,
        description: `This group and its ${group.content_count} content items, images, and audio will be permanently deleted.`,
        destructive: true,
        confirmText: 'Delete group',
      }),
      []
    ),
    run: useCallback(
      (group, callbacks) => deleteGroupMutate(group.id, callbacks),
      [deleteGroupMutate]
    ),
    successToast: 'Deleted',
    errorToast: 'Delete failed',
  });
  const renderGroup = useCallback(
    (group: GroupSummaryT) => (
      <GroupCardSortable group={group} deleteDisabled={deletePending} onDelete={deleteGroup} />
    ),
    [deleteGroup, deletePending]
  );

  const [createOpen, setCreateOpen] = useState(false);

  const { sensors, currentOrder, orderedItems, onDragEnd } = useDndOrder(
    groups,
    useCallback((g) => g.id, []),
    (newOrder, { commit, rollback }) =>
      reorder.mutate(
        { order: newOrder },
        {
          onSuccess: commit,
          onError: (err) => {
            rollback();
            toast.error('Failed to save order', getApiErrorMessage(err));
          },
        }
      )
  );

  return (
    <Section
      title="Content"
      badge={<FolderHeart size={18} />}
      subtitle="Images and audio are supported; audio plays with each image on the device."
      action={
        <Button onClick={() => setCreateOpen(true)} iconLeft={<Plus size={16} />} size="sm">
          New group
        </Button>
      }
    >
      {isPending ? (
        <div className="flex justify-center py-8">
          <Spinner label="Loading" />
        </div>
      ) : groups && groups.length > 0 ? (
        <SortableGrid
          sensors={sensors}
          order={currentOrder}
          items={orderedItems}
          onDragEnd={onDragEnd}
          getKey={(group) => group.id}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up fade-up-2"
          renderItem={renderGroup}
        />
      ) : (
        <EmptyState
          icon={<FolderHeart size={26} />}
          title="No groups yet"
          hint="Create a group to start uploading images. The device displays them in sequence."
          action={
            <Button onClick={() => setCreateOpen(true)} iconLeft={<Plus size={16} />}>
              Create first group
            </Button>
          }
        />
      )}

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (name) => {
          try {
            await create.mutateAsync({ name });
            toast.success('Created');
            setCreateOpen(false);
          } catch (err) {
            toast.error('Create failed', getApiErrorMessage(err));
          }
        }}
        isPending={create.isPending}
      />
    </Section>
  );
});
