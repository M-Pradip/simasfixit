import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isSuperAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminUser, deleteAdminUser, updateAdminUser } from "../actions";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const superadmin = isSuperAdmin(session.role);

  if (!superadmin) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h1 className="text-3xl font-black">Access denied</h1>
        <p className="mt-2 text-base">
          You do not have permission to view or manage admin users.
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Admin users</h1>
          <p className="mt-2 text-slate-600">
            Create and manage admin users with email, password, and role
            assignments.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Create new user</h2>
        <form
          action={createAdminUser}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_180px_180px_140px]"
        >
          <input
            name="name"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Name"
            required
          />
          <input
            name="email"
            type="email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Email"
            required
          />
          <select
            name="role"
            defaultValue="MANAGER"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="SUPERADMIN">Superadmin</option>
            <option value="MANAGER">Manager</option>
            <option value="SUPPORT">Support</option>
          </select>
          <input
            name="password"
            type="password"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Password"
            required
            minLength={6}
          />
          <button
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            type="submit"
          >
            Create user
          </button>
        </form>
      </div>

      <div className="mt-6">
        <DataTable
          headers={["Name", "Email", "Role", "Status", "Managed by"]}
          rows={users.map((user) => [
            <div key={`${user.id}-name`} className="font-bold text-slate-950">
              {user.name}
            </div>,
            user.email,
            <StatusBadge key={`${user.id}-role`} status={user.role} />,
            <StatusBadge
              key={`${user.id}-status`}
              status={user.active ? "ACTIVE" : "INACTIVE"}
            />,
            <div className="flex flex-col gap-2">
              <form
                action={updateAdminUser}
                className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <input type="hidden" name="userId" value={user.id} />
                <input
                  name="name"
                  defaultValue={user.name}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  required
                />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  required
                >
                  <option value="SUPERADMIN">Superadmin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPPORT">Support</option>
                </select>
                <input
                  name="password"
                  type="password"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="New password (leave blank to keep)"
                />
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800"
                    type="submit"
                  >
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteAdminUser} className="flex">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  className="rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
                  type="submit"
                >
                  Delete
                </button>
              </form>
            </div>,
          ])}
          maxHeight="calc(100vh - 260px)"
        />
      </div>
    </div>
  );
}
