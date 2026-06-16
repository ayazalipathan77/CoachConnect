import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { integrations } from "@/server/integrations";

type Channel = "in_app" | "email" | "push";

interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  channels?: Channel[];
  data?: Record<string, unknown>;
}

async function getUserEmail(userId: string): Promise<string | null> {
  const [u] = await db
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return u?.email ?? null;
}

export async function sendNotification({
  userId,
  type,
  title,
  body,
  channels = ["in_app"],
  data,
}: NotifyInput): Promise<void> {
  await Promise.all(
    channels.map(async (channel) => {
      await db.insert(schema.notifications).values({
        userId,
        type,
        channel,
        title,
        body,
        data: data ?? {},
      });

      if (channel === "email") {
        const email = await getUserEmail(userId);
        if (email) {
          await integrations.email.send({ to: email, subject: title, html: `<p>${body}</p>`, text: body });
        }
      }

      if (channel === "push") {
        await integrations.push.send({ userId, title, body });
      }
    }),
  );
}

// ---------------------------------------------------------------------------
// Named event dispatchers — called from booking/messaging services
// ---------------------------------------------------------------------------

export async function notifyBookingConfirmed(opts: {
  clientUserId: string;
  coachUserId: string;
  coachName: string;
  clientName: string;
  sessionType: string;
  startAt: Date;
  bookingId: string;
}): Promise<void> {
  const dateStr = opts.startAt.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  await Promise.all([
    sendNotification({
      userId: opts.clientUserId,
      type: "booking_confirmed",
      title: "Booking confirmed!",
      body: `Your session with ${opts.coachName} on ${dateStr} is confirmed.`,
      channels: ["in_app", "email"],
      data: { bookingId: opts.bookingId },
    }),
    sendNotification({
      userId: opts.coachUserId,
      type: "new_booking",
      title: "New booking",
      body: `${opts.clientName} booked a ${opts.sessionType} session on ${dateStr}.`,
      channels: ["in_app", "email"],
      data: { bookingId: opts.bookingId },
    }),
  ]);
}

export async function notifyCancelledByClient(opts: {
  coachUserId: string;
  clientName: string;
  sessionType: string;
  startAt: Date;
}): Promise<void> {
  const dateStr = opts.startAt.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
  await sendNotification({
    userId: opts.coachUserId,
    type: "booking_cancelled_by_client",
    title: "Booking cancelled",
    body: `${opts.clientName} cancelled their ${opts.sessionType} session on ${dateStr}.`,
    channels: ["in_app", "email"],
  });
}

export async function notifyCancelledByCoach(opts: {
  clientUserId: string;
  coachName: string;
  sessionType: string;
  startAt: Date;
}): Promise<void> {
  const dateStr = opts.startAt.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
  await sendNotification({
    userId: opts.clientUserId,
    type: "booking_cancelled_by_coach",
    title: "Session cancelled by coach",
    body: `${opts.coachName} cancelled your ${opts.sessionType} session on ${dateStr}. A full refund has been issued.`,
    channels: ["in_app", "email"],
  });
}

export async function notifySessionCompleted(opts: {
  clientUserId: string;
  coachName: string;
  bookingId: string;
}): Promise<void> {
  await sendNotification({
    userId: opts.clientUserId,
    type: "session_completed",
    title: "How was your session?",
    body: `Your session with ${opts.coachName} is complete. Leave a review to help other athletes.`,
    channels: ["in_app"],
    data: { bookingId: opts.bookingId },
  });
}

export async function notifyNewMessage(opts: {
  recipientUserId: string;
  senderName: string;
  conversationId: string;
}): Promise<void> {
  await sendNotification({
    userId: opts.recipientUserId,
    type: "new_message",
    title: "New message",
    body: `${opts.senderName} sent you a message.`,
    channels: ["in_app"],
    data: { conversationId: opts.conversationId },
  });
}

export async function notifySessionReminder(opts: {
  userId: string;
  otherName: string;
  sessionType: string;
  startAt: Date;
  window: "24h" | "1h";
  bookingId: string;
}): Promise<void> {
  const timeStr = opts.startAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const label = opts.window === "24h" ? "tomorrow" : "in 1 hour";
  await sendNotification({
    userId: opts.userId,
    type: `reminder_${opts.window}_${opts.bookingId}`,
    title: `Session reminder`,
    body: `Your ${opts.sessionType} session with ${opts.otherName} starts ${label} at ${timeStr}.`,
    channels: opts.window === "1h" ? ["in_app", "push"] : ["in_app", "email"],
    data: { bookingId: opts.bookingId },
  });
}
