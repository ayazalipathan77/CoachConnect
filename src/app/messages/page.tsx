import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getConversations } from "@/server/repositories/messages";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function MessagesPage() {
  const user = await requireUser();
  const conversations = await getConversations(user.userId);

  return (
    <DashboardShell user={user}>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Messages</h1>
      <p className="text-white/40 text-sm mb-8">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>

      {conversations.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No conversations yet.</p>
          {user.role === "client" && (
            <Link href="/discover" className="inline-block mt-4 text-brand text-sm hover:underline">
              Find a coach to message →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-2xl">
          {conversations.map((c) => {
            const otherName = user.userId === c.coachUserId ? c.clientName : c.coachName;
            const otherRole = user.userId === c.coachUserId ? "Client" : "Coach";
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-4 bg-[#111111] border border-white/10 rounded-2xl px-5 py-4 hover:border-brand/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                  <span className="text-brand font-bold text-sm">
                    {(otherName ?? "?")[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold group-hover:text-brand transition-colors truncate">
                      {otherName ?? "Unknown"}
                    </span>
                    {c.lastMessageAt && (
                      <span className="text-white/30 text-xs shrink-0">
                        {formatDistanceToNow(c.lastMessageAt, { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <span className="text-white/40 text-xs">{otherRole}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
