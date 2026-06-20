import { isAdminRole, requireAdminSession } from "@/lib/auth";
import Link from "next/link";

const items: [
  string,
  string,
  ("ALL" | "SUPERADMIN" | "MANAGER" | "SUPPORT")[],
][] = [
  ["Dashboard", "/admin", ["ALL"]],
  ["SIM Inventory", "/admin/sims", ["SUPERADMIN", "MANAGER"]],
  ["Orders", "/admin/orders", ["SUPERADMIN", "MANAGER"]],
  ["Approval", "/admin/approval", ["ALL"]],
  ["Vendors", "/admin/vendors", ["SUPERADMIN", "MANAGER"]],
  ["KYC", "/admin/kyc", ["ALL"]],
  ["Commissions", "/admin/commissions", ["SUPERADMIN", "MANAGER"]],
  ["Payment Methods", "/admin/payment-methods", ["SUPERADMIN", "MANAGER"]],
  ["Operators", "/admin/operators", ["SUPERADMIN", "MANAGER"]],
  ["Contracts", "/admin/contracts", ["SUPERADMIN", "MANAGER"]],
  ["Users", "/admin/users", ["SUPERADMIN"]],
  ["Roles", "/admin/roles", ["SUPERADMIN"]],
];

export async function AdminSidebar() {
  const session = await requireAdminSession();
  const role = session.role;

  return (
    <aside className="flex min-h-screen w-full flex-col bg-slate-950 p-4 text-white lg:w-72">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xl font-black">ASFixit</p>
        <p className="text-sm text-slate-400">Admin operations</p>
      </div>
      <nav className="mt-5 grid gap-1">
        {items
          .filter(
            ([, , allowedRoles]) =>
              allowedRoles.includes("ALL") ||
              (role ? allowedRoles.includes(role) : false),
          )
          .map(([label, href]) => (
            <Link
              key={href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
              href={href}
            >
              {label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
