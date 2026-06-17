import { asc } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { toggleSport } from "@/server/admin/actions";
import { AddSportForm } from "@/components/admin/AddSportForm";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";

export default async function AdminSportsPage() {
  const sports = await db
    .select()
    .from(schema.sports)
    .orderBy(asc(schema.sports.category), asc(schema.sports.sortOrder), asc(schema.sports.name));

  const byCategory = sports.reduce<Record<string, typeof sports>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Sports taxonomy</h1>
      <p className="text-white/40 text-sm mb-8">{sports.length} sports · changes reflect immediately in discovery</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {Object.entries(byCategory).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">{cat}</h2>
              <div className="flex flex-col gap-2">
                {items.map((s) => (
                  <div key={s.id} className={`flex items-center justify-between gap-4 bg-[#111111] border rounded-xl px-5 py-3 ${s.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
                    <span className="font-medium text-sm">{s.name}</span>
                    <form action={toggleSport}>
                      <FormPendingLoader />
                      <input type="hidden" name="sportId" value={s.id} />
                      <input type="hidden" name="active" value={String(s.active)} />
                      <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${s.active ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-brand/20 text-brand hover:bg-brand/10"}`}>
                        {s.active ? "Disable" : "Enable"}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sticky top-8">
            <h2 className="font-bold mb-4">Add a sport</h2>
            <AddSportForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
