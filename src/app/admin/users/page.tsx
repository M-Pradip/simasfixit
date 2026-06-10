import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Admin users</h1>
      <div className="mt-6">
        <DataTable
          headers={["Name", "Email", "Role", "Status"]}
          rows={users.map((user) => [
            user.name,
            user.email,
            <StatusBadge key="role" status={user.role} />,
            <StatusBadge key="status" status={user.active ? "ACTIVE" : "INACTIVE"} />,
          ])}
        />
      </div>
    </div>
  );
}
