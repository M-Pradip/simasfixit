import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [simCount, availableCount, orderCount, vendors, recentOrders] = await Promise.all([
    prisma.sim.count(),
    prisma.sim.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "ASSIGNED"] } } }),
    prisma.vendor.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.order.findMany({
      include: { vendor: true, operator: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const netBalance = vendors.reduce((sum, vendor) => sum + vendor.balance, 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Control room</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Admin dashboard</h1>
          <p className="mt-2 text-slate-600">Inventory, Pasal onboarding, fulfillment, and balances in one place.</p>
        </div>
        <Link className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" href="/admin/orders">
          Fulfill orders
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Total SIMs" value={simCount.toLocaleString("en-IN")} note="All registered inventory" />
        <StatCard label="Available" value={availableCount.toLocaleString("en-IN")} note="Ready for assignment" />
        <StatCard label="Open orders" value={orderCount.toString()} note="Pending or assigned" />
        <StatCard label="Vendor net balance" value={formatMoney(netBalance)} note="Across recent Pasals" />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-950">Recent orders</h2>
        <DataTable
          headers={["Reference", "Vendor", "Operator", "Qty", "Payment", "Status"]}
          rows={recentOrders.map((order) => [
            <Link className="font-bold text-slate-950" href={`/admin/orders/${order.id}`} key={order.id}>{order.reference}</Link>,
            order.vendor.businessName,
            order.operator.name,
            order.quantity,
            order.paymentMethod,
            <StatusBadge key="status" status={order.status} />,
          ])}
        />
      </section>
    </div>
  );
}
