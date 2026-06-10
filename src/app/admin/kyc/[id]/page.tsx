import { notFound } from "next/navigation";
import { DocumentPreview } from "@/components/admin/document-preview";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { updateKycStatus } from "../../actions";

export default async function KycDetailPage(props: PageProps<"/admin/kyc/[id]">) {
  const { id } = await props.params;
  const vendor = await prisma.vendor.findUnique({ where: { id }, include: { documents: true, signedContract: true } });
  if (!vendor) notFound();

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Review {vendor.businessName}</h1>
      <p className="mt-2 text-slate-600">Contract version: {vendor.signedContract?.version ?? "Not signed"}</p>
      {(vendor.kycStatus === "PENDING" || vendor.kycStatus === "REVIEW") && (
        <form action={updateKycStatus} className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <input type="hidden" name="vendorId" value={vendor.id} />
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input name="note" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Decision note" />
            <button name="status" value="APPROVED" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">
              Approve KYC
            </button>
            <button name="status" value="REJECTED" className="rounded-md bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600">
              Reject KYC
            </button>
          </div>
        </form>
      )}
      <div className="mt-6">
        <DataTable
          headers={["Type", "File", "Status", "Note"]}
          rows={vendor.documents.map((doc) => [
            doc.type,
            <DocumentPreview key={doc.id} label={`${vendor.businessName} ${doc.type}`} url={doc.fileUrl} />,
            <StatusBadge key="status" status={doc.status} />,
            doc.note ?? "-",
          ])}
        />
      </div>
    </div>
  );
}
