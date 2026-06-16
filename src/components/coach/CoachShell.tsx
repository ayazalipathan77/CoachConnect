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
      {/*
        flex-col on mobile  → sidebar (pills) stacks above content
        lg:flex-row on desktop → sidebar (vertical links) sits left of content
      */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <CoachSidebar />
        <div className="flex-1 min-w-0 w-full">{children}</div>
      </div>
    </DashboardShell>
  );
}
