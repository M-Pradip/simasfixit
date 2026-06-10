import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireVendorSession } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function VendorDashboard() {
  const session = await requireVendorSession();
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: session.id },
    include: { sims: true, orders: true },
  });
  const approved = vendor.sims.filter((sim) => sim.status === "APPROVED").length;
  const rejected = vendor.sims.filter((sim) => sim.status === "REJECTED").length;

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
        <StatCard label="Total SIMs ordered" value={vendor.sims.length.toString()} note="Assigned to this Pasal" />
        <StatCard label="Approved" value={approved.toString()} note="Commission credited" />
        <StatCard label="Rejected" value={rejected.toString()} note="Fine deducted" />
        <StatCard label="Current balance" value={formatMoney(vendor.balance)} note={vendor.balance < 0 ? "Must be cleared" : "Available ledger balance"} />
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">KYC status</p>
        <div className="mt-2"><StatusBadge status={vendor.kycStatus} /></div>
      </div>
    </div>
  );
}
