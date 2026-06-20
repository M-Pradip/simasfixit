import { AccessDenied } from "@/components/admin/access-denied";
import { DataTable } from "@/components/data-table";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

export default async function CommissionsPage() {
  const session = await requireAdminSession();
  if (!isPrivilegedAdmin(session.role)) {
    return (
      <AccessDenied message="You do not have permission to view commissions." />
    );
  }
  const vendors = await prisma.vendor.findMany({
    include: { ledger: true },
    orderBy: { businessName: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">
        Commission and fine overview
      </h1>
      <div className="mt-6">
        <DataTable
          headers={[
            "Vendor",
            "Commission earned",
            "Fines incurred",
            "Adjustments",
            "Current balance",
          ]}
          rows={vendors.map((vendor) => {
            const commission = vendor.ledger
              .filter(
                (entry) => entry.amount > 0 && entry.type === "SIM_APPROVED",
              )
              .reduce((sum, entry) => sum + entry.amount, 0);
            const fines = vendor.ledger
              .filter((entry) => entry.type === "SIM_REJECTED")
              .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
            const adjustments = vendor.ledger
              .filter((entry) => entry.type === "MANUAL_ADJUSTMENT")
              .reduce((sum, entry) => sum + entry.amount, 0);
            return [
              <Link
                className="font-bold text-slate-950"
                href={`/admin/vendors/${vendor.id}`}
                key={vendor.id}
              >
                {vendor.businessName}
              </Link>,
              formatMoney(commission),
              formatMoney(-fines),
              formatMoney(adjustments),
              <span
                className={
                  vendor.balance < 0
                    ? "font-bold text-rose-700"
                    : "font-bold text-emerald-700"
                }
                key="balance"
              >
                {formatMoney(vendor.balance)}
              </span>,
            ];
          })}
        />
      </div>
    </div>
  );
}
