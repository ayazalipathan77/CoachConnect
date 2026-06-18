import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { db, schema } from "@/server/db";
import { AdminCoachEditForm } from "@/components/admin/AdminCoachEditForm";
import { AdminDocumentsReview } from "@/components/admin/AdminDocumentsReview";
import { getCoachDocuments } from "@/server/repositories/media";

export default async function AdminCoachEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [coach] = await db
    .select({
      id: schema.coachProfiles.id,
      userId: schema.coachProfiles.userId,
      headline: schema.coachProfiles.headline,
      bio: schema.coachProfiles.bio,
      defaultRateMinor: schema.coachProfiles.defaultRateMinor,
      visibility: schema.coachProfiles.visibility,
      status: schema.coachProfiles.status,
      name: schema.users.name,
      email: schema.users.email,
    })
    .from(schema.coachProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.coachProfiles.userId))
    .where(eq(schema.coachProfiles.id, id))
    .limit(1);

  if (!coach) notFound();

  const documents = await getCoachDocuments(coach.userId);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/coaches" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Coaches
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Pencil className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Edit coach</h1>
          <p className="text-white/40 text-sm mt-0.5">{coach.name ?? "(no name)"} · {coach.email}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8">
        <AdminCoachEditForm
          defaults={{
            coachId: coach.id,
            headline: coach.headline,
            bio: coach.bio,
            defaultRateGBP: coach.defaultRateMinor != null ? coach.defaultRateMinor / 100 : null,
            visibility: coach.visibility,
            status: coach.status,
          }}
        />
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 mt-6">
        <h2 className="font-bold mb-1">Qualifications & documents</h2>
        <p className="text-white/40 text-sm mb-5">
          Approve a document to show it as verified on the coach&apos;s public profile.
        </p>
        <AdminDocumentsReview coachId={coach.id} documents={documents} />
      </div>
    </div>
  );
}
