import { isSuperAdmin, requireAdminSession } from "@/lib/auth";

const roles = [
  [
    "Superadmin",
    "Full access including operator, contract, user, and role management",
  ],
  [
    "Manager",
    "SIMs, orders, vendors, KYC, balance adjustments, and approval processing",
  ],
  ["Support", "View-only access and KYC document review support"],
  ["Vendor", "Own orders, SIM statuses, balance ledger, and profile"],
];

export default async function RolesPage() {
  const session = await requireAdminSession();
  const superadmin = isSuperAdmin(session.role);

  if (!superadmin) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h1 className="text-3xl font-black">Access denied</h1>
        <p className="mt-2 text-base">
          You do not have permission to manage roles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">
        Roles and permissions
      </h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {roles.map(([role, access]) => (
          <div
            key={role}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <h2 className="text-xl font-bold text-slate-950">{role}</h2>
            <p className="mt-2 text-slate-600">{access}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
