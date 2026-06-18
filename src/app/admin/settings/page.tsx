import { asc } from "drizzle-orm";
import { Star } from "lucide-react";
import { db, schema } from "@/server/db";
import { getPlatformSettings } from "@/server/repositories/settings";
import { toggleFeaturedPlan } from "@/server/admin/settings-actions";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";
import { AddFeaturedPlanForm } from "@/components/admin/AddFeaturedPlanForm";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";
import { gbp } from "@/lib/money";

export default async function AdminSettingsPage() {
  const [settings, plans] = await Promise.all([
    getPlatformSettings(),
    db.select().from(schema.featuredPlans).orderBy(asc(schema.featuredPlans.sortOrder)),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Platform settings</h1>
      <p className="text-white/40 text-sm mb-8">Business rules, payouts metadata, and the featured-placement plan catalog.</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold mb-4">Business rules & payouts</h2>
            <PlatformSettingsForm
              defaults={{
                platformCommissionPercent: Math.round(settings.platformCommissionRate * 1000) / 10,
                platformMinFeeGBP: settings.platformMinFeeMinor / 100,
                stripeAccountLabel: settings.stripeAccountLabel,
                supportEmail: settings.supportEmail,
                payoutInstructions: settings.payoutInstructions,
              }}
            />
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Featured placement plans</h2>
            <div className="flex flex-col gap-2">
              {plans.length === 0 && (
                <p className="text-white/30 text-sm">No plans yet — add one to let coaches purchase featured placement.</p>
              )}
              {plans.map((p) => (
                <div key={p.id} className={`flex items-center justify-between gap-4 bg-[#111111] border rounded-xl px-5 py-3 ${p.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-brand" />
                    <div>
                      <p className="font-medium text-sm">{p.label}</p>
                      <p className="text-white/40 text-xs">{p.durationDays} days · {gbp(p.priceMinor)} · key: {p.key}</p>
                    </div>
                  </div>
                  <form action={toggleFeaturedPlan}>
                    <FormPendingLoader />
                    <input type="hidden" name="planId" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${p.active ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-brand/20 text-brand hover:bg-brand/10"}`}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sticky top-8">
            <h2 className="font-bold mb-4">Add a featured plan</h2>
            <AddFeaturedPlanForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
