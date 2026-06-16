import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { CoachSidebar } from './CoachSidebar';
import type { SessionPayload } from '@/server/auth/session';

export function CoachShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell user={user}>
      <div className="flex gap-8 lg:gap-12 items-start">
        <CoachSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </DashboardShell>
  );
}
