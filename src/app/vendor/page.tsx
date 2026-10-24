import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireVendorSession } from "@/lib/auth";
import { formatMoney, formatNepalDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VendorDashboard() {
  const session = await requireVendorSession();
  const [vendor, simCounts, recentOrders] = await Promise.all([
    prisma.vendor.findUniqueOrThrow({
      where: { id: session.id },
      select: { businessName: true, balance: true, kycStatus: true },
    }),
    prisma.sim.groupBy({
      by: ["status"],
      where: { assignedVendorId: session.id },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: { vendorId: session.id },
      include: { operator: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const simCount = (status: "ASSIGNED" | "APPROVED" | "REJECTED") =>
    simCounts.find((item) => item.status === status)?._count._all ?? 0;
  const totalSims = simCounts.reduce((total, item) => total + item._count._all, 0);

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Vendor dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome back, {vendor.businessName}.</p>
      {vendor.balance < 0 && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-bold">Ordering blocked</p>
          <p className="mt-1 text-sm">Your current balance is negative. Please settle outstanding balance with ASFixit before placing a new SIM order.</p>
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total SIMs assigned" value={totalSims.toString()} note="Assigned to this Pasal" />
        <StatCard label="Approved" value={simCount("APPROVED").toString()} note="Commission credited" />
        <StatCard label="Rejected" value={simCount("REJECTED").toString()} note="Fine deducted" />
        <StatCard label="Current balance" value={formatMoney(vendor.balance)} note={vendor.balance < 0 ? "Must be cleared" : "Available ledger balance"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recent orders</h2>
              <p className="mt-1 text-sm text-slate-500">Your latest SIM orders and their status.</p>
            </div>
            <Link href="/vendor/orders" className="shrink-0 text-sm font-bold text-teal-700 hover:text-teal-800">
              View all
            </Link>
          </div>
          {recentOrders.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{order.reference}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.operator.name} <span aria-hidden="true">·</span> {order.quantity} SIMs
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatNepalDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-sm font-bold text-slate-800">{formatMoney(order.amountDue)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-md bg-slate-50 p-4">
              <p className="text-sm text-slate-600">You haven’t placed an order yet.</p>
              <Link href="/vendor/orders/new" className="mt-3 inline-flex rounded-md bg-teal-700 px-3 py-2 text-sm font-bold text-white hover:bg-teal-800">
                Place your first order
              </Link>
            </div>
          )}
        </section>

        <div className="grid content-start gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">My SIMs</h2>
              <Link href="/vendor/sims" className="text-sm font-bold text-teal-700 hover:text-teal-800">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(["ASSIGNED", "APPROVED", "REJECTED"] as const).map((status) => (
                <div key={status} className="flex items-center justify-between gap-3">
                  <StatusBadge status={status} />
                  <span className="font-bold tabular-nums text-slate-900">{simCount(status)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">KYC status</p>
            <div className="mt-2"><StatusBadge status={vendor.kycStatus} /></div>
          </section>
        </div>
      </div>
    </div>
  );
}
