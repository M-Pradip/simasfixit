import Link from "next/link";

const items = [
  ["Dashboard", "/admin"],
  ["SIM Inventory", "/admin/sims"],
  ["Orders", "/admin/orders"],
  ["Approval", "/admin/approval"],
  ["Vendors", "/admin/vendors"],
  ["KYC", "/admin/kyc"],
  ["Commissions", "/admin/commissions"],
  ["Payment Methods", "/admin/payment-methods"],
  ["Operators", "/admin/operators"],
  ["Contracts", "/admin/contracts"],
  ["Users", "/admin/users"],
  ["Roles", "/admin/roles"],
];

export function AdminSidebar() {
  return (
    <aside className="flex min-h-screen w-full flex-col bg-slate-950 p-4 text-white lg:w-72">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xl font-black">ASFixit</p>
        <p className="text-sm text-slate-400">Admin operations</p>
      </div>
      <nav className="mt-5 grid gap-1">
        {items.map(([label, href]) => (
          <Link key={href} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white" href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
