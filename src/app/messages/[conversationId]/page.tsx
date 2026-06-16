import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getConversation, getMessages, markMessagesRead } from "@/server/repositories/messages";
import { MessageComposer } from "@/components/messaging/MessageComposer";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [user, { conversationId }] = await Promise.all([requireUser(), params]);

  const conv = await getConversation(conversationId);
  if (!conv) notFound();

  const isParticipant = conv.coachUserId === user.userId || conv.clientUserId === user.userId;
  if (!isParticipant) notFound();

  await markMessagesRead(conversationId, user.userId);
  const messages = await getMessages(conversationId);

  const otherName = user.userId === conv.coachUserId ? conv.clientName : conv.coachName;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-4 lg:px-8 py-4 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
        <Link href="/messages" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
          <span className="text-brand font-bold text-sm">{(otherName ?? "?")[0]?.toUpperCase()}</span>
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">{otherName ?? "Unknown"}</p>
          <p className="text-white/40 text-xs">
            {user.userId === conv.coachUserId ? "Client" : "Coach"}
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 px-4 lg:px-8 py-6 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        {messages.length === 0 && (
          <p className="text-center text-white/30 text-sm py-12">No messages yet. Say hello!</p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === user.userId;
          return (
            <div key={m.id} className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? "bg-brand text-black rounded-br-sm"
                    : "bg-[#1a1a1a] border border-white/10 text-white rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span>{format(m.createdAt, "HH:mm")}</span>
                {isMine && (
                  m.readAt
                    ? <CheckCheck className="w-3 h-3 text-brand" />
                    : <Check className="w-3 h-3" />
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Composer pinned to bottom */}
      <div className="sticky bottom-0 max-w-3xl w-full mx-auto">
        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
}
