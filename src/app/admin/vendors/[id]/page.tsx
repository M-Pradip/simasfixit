import { AccessDenied } from "@/components/admin/access-denied";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatNepalDateTime } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjustVendorBalance, updateVendorRates } from "../../actions";

export default async function VendorDetailPage(
  props: PageProps<"/admin/vendors/[id]">,
) {
  const session = await requireAdminSession();
  if (!isPrivilegedAdmin(session.role)) {
    return (
      <AccessDenied message="You do not have permission to view vendor details." />
    );
  }

  const { id } = await props.params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      signedContract: true,
      documents: true,
      ledger: {
        include: { sim: true, order: true, adminUser: true },
        orderBy: { createdAt: "desc" },
      },
      orders: { include: { operator: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!vendor) notFound();

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">
        {vendor.businessName}
      </h1>
      <p className="mt-2 text-slate-600">
        {vendor.ownerName} - {vendor.phone} - {vendor.address}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Balance</p>
          <p
            className={
              vendor.balance < 0
                ? "mt-2 text-2xl font-black text-rose-700"
                : "mt-2 text-2xl font-black text-emerald-700"
            }
          >
            {formatMoney(vendor.balance)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">KYC</p>
          <div className="mt-2">
            <StatusBadge status={vendor.kycStatus} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Commission</p>
          <p className="mt-2 text-2xl font-black">
            Rs. {vendor.commissionOverride ?? "Default"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Fine</p>
          <p className="mt-2 text-2xl font-black">
            Rs. {vendor.fineOverride ?? "Default"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form
          action={adjustVendorBalance}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <input type="hidden" name="vendorId" value={vendor.id} />
          <h2 className="text-lg font-bold text-slate-950">Adjust balance</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
            <input
              name="amount"
              type="number"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Rs. amount"
              required
            />
            <input
              name="note"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Required note"
              required
            />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
              Update
            </button>
          </div>
        </form>

        <form
          action={updateVendorRates}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <input type="hidden" name="vendorId" value={vendor.id} />
          <h2 className="text-lg font-bold text-slate-950">Vendor rates</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="commissionOverride"
              type="number"
              min="0"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Default commission"
              defaultValue={vendor.commissionOverride ?? ""}
            />
            <input
              name="fineOverride"
              type="number"
              min="0"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Default fine"
              defaultValue={vendor.fineOverride ?? ""}
            />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
              Save Rates
            </button>
          </div>
        </form>
      </div>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Review documents
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              KYC files are reviewed from the dedicated document screen.
            </p>
          </div>
          <Link
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-white"
            href={`/admin/kyc/${vendor.id}`}
          >
            Review Documents
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-950">Ledger</h2>
        <DataTable
          maxHeight="620px"
          headers={["Date", "Type", "Reference", "Amount", "Balance", "Note"]}
          rows={vendor.ledger.map((entry) => [
            formatNepalDateTime(entry.createdAt),
            entry.type,
            entry.sim?.number ?? entry.order?.reference ?? "-",
            <span
              className={
                entry.amount < 0
                  ? "font-bold text-rose-700"
                  : "font-bold text-emerald-700"
              }
              key={entry.id}
            >
              {formatMoney(entry.amount)}
            </span>,
            formatMoney(entry.runningBalance),
            entry.note,
          ])}
        />
      </section>
    </div>
  );
}
