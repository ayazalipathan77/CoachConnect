"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { createBooking } from "@/server/services/booking";

export type BookState = { error?: string } | undefined;

export async function confirmBooking(
  _prev: BookState,
  formData: FormData,
): Promise<BookState> {
  const user = await getCurrentUser();
  const slotId = String(formData.get("slotId") ?? "");
  if (!user) redirect(`/login?next=/book/${slotId}`);
  if (user.role !== "client") {
    return { error: "Switch to an athlete account to book sessions." };
  }

  const result = await createBooking({
    slotId,
    clientUserId: user.userId,
    message: String(formData.get("message") ?? "") || undefined,
  });

  if (!result.ok) return { error: result.error };
  redirect(`/bookings?booked=${result.bookingId}`);
}
