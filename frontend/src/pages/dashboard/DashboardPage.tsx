import { useDevices } from '@/features/devices/query/device-queries';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGroups } from '@/features/groups/query/group-queries';
import { DevicesSection } from '@/features/devices/components/DevicesSection';
import { GroupsSection } from '@/features/groups/components/GroupsSection';

export function DashboardPage() {
  const { user } = useAuth();
  const devices = useDevices();
  const groups = useGroups();

  return (
    <div>
      <header className="pb-2 fade-up">
        <h1 className="font-serif text-[36px] sm:text-[48px] font-bold leading-[1.1] tracking-tight text-ink">
          {dashboardGreeting()}, <em className="not-italic">{user?.username || 'there'}</em>
        </h1>
      </header>

      <DevicesSection devices={devices.data} groups={groups.data} isPending={devices.isPending} />
      <GroupsSection groups={groups.data} isPending={groups.isPending} />
    </div>
  );
}

function dashboardGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 6) return 'Good night';
  if (hour < 11) return 'Good morning';
  if (hour < 14) return 'Good afternoon';
  if (hour < 18) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Good night';
}
