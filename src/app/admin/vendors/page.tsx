import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Vendors / Pasals</h1>
      <p className="mt-2 text-slate-600">Onboarding, KYC status, rates, notes, and order lock state.</p>
      <div className="mt-6">
        <DataTable
          headers={["Pasal", "Owner", "Phone", "KYC", "Status", "Balance", "Order access"]}
          rows={vendors.map((vendor) => [
            <Link className="font-bold text-slate-950" href={`/admin/vendors/${vendor.id}`} key={vendor.id}>{vendor.businessName}</Link>,
            vendor.ownerName,
            vendor.phone,
            <StatusBadge key="kyc" status={vendor.kycStatus} />,
            <StatusBadge key="status" status={vendor.status} />,
            <span className={vendor.balance < 0 ? "font-bold text-rose-700" : "font-bold text-emerald-700"} key="balance">{formatMoney(vendor.balance)}</span>,
            vendor.balance < 0 ? <StatusBadge key="blocked" status="REJECTED" /> : <StatusBadge key="open" status="ACTIVE" />,
          ])}
        />
      </div>
    </div>
  );
}
