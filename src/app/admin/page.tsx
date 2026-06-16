import { count, eq } from "drizzle-orm";
import { Users, CalendarCheck, Star, Dumbbell } from "lucide-react";
import { db, schema } from "@/server/db";

export default async function AdminOverview() {
  const [[users], [coaches], [bookings], [reviews], [pendingCoaches]] = await Promise.all([
    db.select({ n: count() }).from(schema.users),
    db.select({ n: count() }).from(schema.coachProfiles),
    db.select({ n: count() }).from(schema.bookings),
    db.select({ n: count() }).from(schema.reviews),
    db
      .select({ n: count() })
      .from(schema.coachProfiles)
      .where(eq(schema.coachProfiles.verificationStatus, "unverified")),
  ]);

  const stats = [
    { label: "Total users", value: users?.n ?? 0, icon: Users },
    { label: "Coach profiles", value: coaches?.n ?? 0, icon: Users },
    { label: "Bookings", value: bookings?.n ?? 0, icon: CalendarCheck },
    { label: "Reviews", value: reviews?.n ?? 0, icon: Star },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Admin overview</h1>
      <p className="text-white/40 text-sm mb-8">Platform health at a glance.</p>

      {(pendingCoaches?.n ?? 0) > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl px-5 py-3.5 text-sm font-medium">
          <Star className="w-4 h-4 shrink-0" />
          {pendingCoaches?.n} coach{pendingCoaches?.n === 1 ? "" : "es"} pending verification.{" "}
          <a href="/admin/coaches" className="underline underline-offset-2">Review now →</a>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <Icon className="w-5 h-5 text-brand mb-3" />
            <div className="font-display font-bold text-3xl">{value.toLocaleString()}</div>
            <div className="text-white/50 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { href: "/admin/coaches", label: "Verification queue", icon: Users, desc: "Approve or reject new coaches" },
          { href: "/admin/reviews", label: "Review moderation", icon: Star, desc: "Hide inappropriate reviews" },
          { href: "/admin/sports", label: "Sports taxonomy", icon: Dumbbell, desc: "Add or disable sports" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <a key={href} href={href} className="group bg-[#111111] border border-white/10 hover:border-brand/40 rounded-2xl p-6 transition-colors">
            <Icon className="w-5 h-5 text-brand mb-3" />
            <p className="font-bold group-hover:text-brand transition-colors">{label}</p>
            <p className="text-white/40 text-sm mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
