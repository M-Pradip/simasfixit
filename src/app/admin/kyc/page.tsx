import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function KycPage() {
  await requireAdminSession();
  const vendors = await prisma.vendor.findMany({
    include: { documents: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">KYC submissions</h1>
      <div className="mt-6">
        <DataTable
          headers={[
            "Vendor",
            "Owner",
            "Documents",
            "KYC status",
            "Account status",
          ]}
          rows={vendors.map((vendor) => [
            <Link
              className="font-bold text-slate-950"
              href={`/admin/kyc/${vendor.id}`}
              key={vendor.id}
            >
              {vendor.businessName}
            </Link>,
            vendor.ownerName,
            vendor.documents.length,
            <StatusBadge key="kyc" status={vendor.kycStatus} />,
            <StatusBadge key="status" status={vendor.status} />,
          ])}
        />
      </div>
    </div>
  );
}
