import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { db, schema } from "@/server/db";
import { AdminUserEditForm } from "@/components/admin/AdminUserEditForm";

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-brand/10 text-brand border-brand/20",
  coach: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  client: "bg-white/5 text-white/60 border-white/10",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  const allUsers = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt));

  const users = role && role !== "all" ? allUsers.filter((u) => u.role === role) : allUsers;

  const filters = [
    { label: "All", value: "all" },
    { label: "Clients", value: "client" },
    { label: "Coaches", value: "coach" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Users</h1>
      <p className="text-white/40 text-sm mb-6">{allUsers.length} total accounts</p>

      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <a
            key={f.value}
            href={f.value === "all" ? "/admin/users" : `/admin/users?role=${f.value}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
              (role ?? "all") === f.value
                ? "bg-brand text-black border-brand"
                : "bg-white/5 text-white/60 border-white/10 hover:text-white"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <div key={u.id} className="bg-[#111111] border border-white/10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">{u.name ?? "(no name)"}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${ROLE_STYLE[u.role]}`}>
                  {u.role}
                </span>
              </div>
              <p className="text-white/40 text-xs mt-1">{u.email} · joined {format(u.createdAt, "d MMM yyyy")}</p>
            </div>
            <AdminUserEditForm user={u} />
          </div>
        ))}
      </div>
    </div>
  );
}
