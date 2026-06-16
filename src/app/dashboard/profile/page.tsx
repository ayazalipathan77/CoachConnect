import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { User, ArrowLeft } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ClientProfileForm } from "@/components/client/ClientProfileForm";
import { ClientAvatarUpload } from "@/components/client/ClientAvatarUpload";
import { ClientSportsManager } from "@/components/client/ClientSportsManager";

export default async function ClientProfilePage() {
  const user = await requireUser();
  if (user.role === "coach") redirect("/dashboard/coach/profile");
  if (user.role === "admin") redirect("/admin");

  const [userData, allSports] = await Promise.all([
    db
      .select({
        name: schema.users.name,
        image: schema.users.image,
        locationCity: schema.users.locationCity,
        locationPostcode: schema.users.locationPostcode,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({ id: schema.sports.id, name: schema.sports.name })
      .from(schema.sports)
      .where(eq(schema.sports.active, true))
      .orderBy(schema.sports.name),
  ]);

  const [clientProfile] = await db
    .select({ id: schema.clientProfiles.id, dob: schema.clientProfiles.dob })
    .from(schema.clientProfiles)
    .where(eq(schema.clientProfiles.userId, user.userId))
    .limit(1);

  const currentSports = clientProfile
    ? await db
        .select({ id: schema.sports.id, name: schema.sports.name })
        .from(schema.clientPreferredSports)
        .innerJoin(schema.sports, eq(schema.sports.id, schema.clientPreferredSports.sportId))
        .where(eq(schema.clientPreferredSports.clientId, clientProfile.id))
    : [];

  return (
    <DashboardShell user={user}>
      <div className="max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <User className="w-5 h-5 text-brand" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight">My profile</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Photo */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Photo</h3>
            <ClientAvatarUpload currentImage={userData?.image ?? null} />
          </div>

          {/* Profile details */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Personal details</h3>
            <ClientProfileForm
              defaultValues={{
                name: userData?.name ?? null,
                locationCity: userData?.locationCity ?? null,
                locationPostcode: userData?.locationPostcode ?? null,
                dob: clientProfile?.dob ?? null,
              }}
            />
          </div>

          {/* Preferred sports */}
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Sports you play</h3>
            <ClientSportsManager currentSports={currentSports} allSports={allSports} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
