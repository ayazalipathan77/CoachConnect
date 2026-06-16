import Link from "next/link";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import {
  getConversations,
  countConversations,
} from "@/server/repositories/messages";
import { CONVERSATIONS_PAGE_SIZE } from "@/lib/pagination";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ConversationList } from "@/components/messaging/ConversationList";

export default async function MessagesPage() {
  const user = await requireUser();

  const [conversations, total] = await Promise.all([
    getConversations(user.userId, CONVERSATIONS_PAGE_SIZE, 0),
    countConversations(user.userId),
  ]);

  return (
    <DashboardShell user={user}>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-brand" />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Messages</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">
        {total} conversation{total !== 1 ? "s" : ""}
        {total > CONVERSATIONS_PAGE_SIZE && (
          <span className="ml-1 text-white/25">· showing {Math.min(CONVERSATIONS_PAGE_SIZE, total)} first</span>
        )}
      </p>

      <ConversationList
        initial={conversations}
        currentUserId={user.userId}
        currentUserRole={user.role}
        totalCount={total}
        emptySlot={
          user.role === "client" ? (
            <Link href="/discover" className="inline-block mt-4 text-brand text-sm hover:underline">
              Find a coach to message →
            </Link>
          ) : undefined
        }
      />
    </DashboardShell>
  );
}
