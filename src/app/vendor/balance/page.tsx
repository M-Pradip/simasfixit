import { DataTable } from "@/components/data-table";
import { requireVendorSession } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function VendorBalancePage() {
  const session = await requireVendorSession();
  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: session.id },
    include: { ledger: { include: { sim: true, order: true }, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Balance ledger</h1>
      <p className={vendor.balance < 0 ? "mt-2 text-xl font-black text-rose-700" : "mt-2 text-xl font-black text-emerald-700"}>{formatMoney(vendor.balance)}</p>
      <div className="mt-6">
        <DataTable
          headers={["Date", "Type", "Reference", "Amount", "Running balance", "Note"]}
          rows={vendor.ledger.map((entry) => [
            entry.createdAt.toLocaleDateString(),
            entry.type,
            entry.sim?.number ?? entry.order?.reference ?? "-",
            <span className={entry.amount < 0 ? "font-bold text-rose-700" : "font-bold text-emerald-700"} key={entry.id}>{formatMoney(entry.amount)}</span>,
            formatMoney(entry.runningBalance),
            entry.note,
          ])}
        />
      </div>
    </div>
  );
}
