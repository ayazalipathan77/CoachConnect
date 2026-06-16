/**
 * Standalone cron script — invoked by Render Cron service every 30 minutes.
 * Calls the /api/cron/reminders endpoint on the web service using the shared CRON_SECRET.
 * This avoids duplicating DB logic; the web service handles idempotency.
 */
async function main(): Promise<void> {
  const baseUrl = process.env.RENDER_EXTERNAL_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  const secret = process.env.CRON_SECRET ?? "";

  const url = `${baseUrl}/api/cron/reminders`;
  console.log(`[cron-reminders] POST ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-cron-secret": secret,
      "content-type": "application/json",
    },
  });

  const body = await res.json();
  console.log(`[cron-reminders] status=${res.status}`, body);

  if (!res.ok) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[cron-reminders] fatal:", err);
  process.exit(1);
});
