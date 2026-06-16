import { NextRequest, NextResponse } from "next/server";
import { and, between, eq } from "drizzle-orm";
import { addHours } from "date-fns";
import { db, schema } from "@/server/db";
import { reminderAlreadySent } from "@/server/repositories/notifications";
import { notifySessionReminder } from "@/server/notifications/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

type Window = "24h" | "1h";

interface BookingRow {
  bookingId: string;
  clientId: string;
  coachId: string;
  startAt: Date;
  sessionType: string;
}

async function fetchUpcoming(from: Date, to: Date): Promise<BookingRow[]> {
  return db
    .select({
      bookingId: schema.bookings.id,
      clientId: schema.bookings.clientId,
      coachId: schema.bookings.coachId,
      startAt: schema.slots.startAt,
      sessionType: schema.slots.sessionType,
    })
    .from(schema.bookings)
    .innerJoin(schema.slots, eq(schema.slots.id, schema.bookings.slotId))
    .where(
      and(
        eq(schema.bookings.status, "confirmed"),
        between(schema.slots.startAt, from, to),
      ),
    );
}

async function resolveParticipants(clientId: string, coachId: string) {
  const [clientRow, coachRow] = await Promise.all([
    db
      .select({ userId: schema.clientProfiles.userId, name: schema.users.name })
      .from(schema.clientProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.clientProfiles.userId))
      .where(eq(schema.clientProfiles.id, clientId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ userId: schema.coachProfiles.userId, name: schema.users.name })
      .from(schema.coachProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
      .where(eq(schema.coachProfiles.id, coachId))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);
  return { clientRow, coachRow };
}

async function maybeRemind(
  userId: string,
  otherName: string,
  bookingId: string,
  sessionType: string,
  startAt: Date,
  window: Window,
): Promise<boolean> {
  const type = `reminder_${window}_${bookingId}`;
  if (await reminderAlreadySent(userId, type)) return false;
  await notifySessionReminder({ userId, otherName, sessionType, startAt, window, bookingId });
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;

  const [bookings24h, bookings1h] = await Promise.all([
    fetchUpcoming(addHours(now, 23), addHours(now, 25)),
    fetchUpcoming(addHours(now, 50 / 60), addHours(now, 70 / 60)),
  ]);

  const allJobs: Array<{ row: BookingRow; window: Window }> = [
    ...bookings24h.map((row) => ({ row, window: "24h" as Window })),
    ...bookings1h.map((row) => ({ row, window: "1h" as Window })),
  ];

  for (const { row, window } of allJobs) {
    const { clientRow, coachRow } = await resolveParticipants(row.clientId, row.coachId);

    const [clientSent, coachSent] = await Promise.all([
      clientRow
        ? maybeRemind(clientRow.userId, coachRow?.name ?? "your coach", row.bookingId, row.sessionType, row.startAt, window)
        : Promise.resolve(false),
      coachRow
        ? maybeRemind(coachRow.userId, clientRow?.name ?? "your client", row.bookingId, row.sessionType, row.startAt, window)
        : Promise.resolve(false),
    ]);

    if (clientSent) sent++;
    if (coachSent) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
