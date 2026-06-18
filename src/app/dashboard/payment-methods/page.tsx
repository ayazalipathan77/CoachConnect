import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft, CreditCard } from "lucide-react";
import { db, schema } from "@/server/db";
import { requireRole } from "@/server/auth/current-user";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PaymentMethodsManager } from "@/components/client/PaymentMethodsManager";

export default async function PaymentMethodsPage() {
  const user = await requireRole("client");

  const [client] = await db
    .select({ id: schema.clientProfiles.id })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);

  const methods = client
    ? await db
        .select()
        .from(schema.clientPaymentMethods)
        .where(eq(schema.clientPaymentMethods.clientId, client.id))
    : [];

  return (
    <DashboardShell user={user}>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Payment methods</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage saved cards and your refund account</p>
        </div>
      </div>

      <PaymentMethodsManager methods={methods} />
    </DashboardShell>
  );
}
