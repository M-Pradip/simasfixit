import Link from "next/link";

const items = [
  ["Dashboard", "/vendor"],
  ["Orders", "/vendor/orders"],
  ["New Order", "/vendor/orders/new"],
  ["My SIMs", "/vendor/sims"],
  ["Balance", "/vendor/balance"],
  ["Profile", "/vendor/profile"],
];

export function VendorSidebar() {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-slate-200 bg-white p-4 lg:w-64">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xl font-black text-slate-950">Pasal Portal</p>
        <p className="text-sm text-slate-500">Vendor workspace</p>
      </div>
      <nav className="mt-5 grid gap-1">
        {items.map(([label, href]) => (
          <Link key={href} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950" href={href}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
