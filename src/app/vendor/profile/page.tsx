import { StatusBadge } from "@/components/status-badge";
import { requireVendorSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VendorProfilePage() {
  const session = await requireVendorSession();
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: session.id },
    include: { signedContract: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Profile</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          ["Business", vendor.businessName],
          ["Owner", vendor.ownerName],
          ["Phone", vendor.phone],
          ["Email", vendor.email ?? "-"],
          ["Address", vendor.address],
          ["Citizenship", vendor.citizenshipNumber],
          ["PAN", vendor.panNumber],
          ["Contract", vendor.signedContract?.version ?? "Not signed"],
          ["Commission rate", vendor.commissionOverride ? `Rs. ${vendor.commissionOverride}` : "Operator default"],
          ["Fine rate", vendor.fineOverride ? `Rs. ${vendor.fineOverride}` : "Operator default"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 font-bold text-slate-950">{value}</p>
          </div>
        ))}
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">KYC status</p>
          <div className="mt-2"><StatusBadge status={vendor.kycStatus} /></div>
        </div>
      </div>
    </div>
  );
}
