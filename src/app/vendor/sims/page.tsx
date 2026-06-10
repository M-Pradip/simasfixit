import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { requireVendorSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export default async function VendorSimsPage() {
  const session = await requireVendorSession();
  const sims = await prisma.sim.findMany({
    where: { assignedVendorId: session.id },
    include: { operator: true, order: true },
    orderBy: { number: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">My SIM status</h1>
      <div className="mt-6">
        <DataTable
          headers={["SIM", "Operator", "Order", "Status", "Commission/Fine"]}
          rows={sims.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sim: any) => [
              <span className="font-mono text-xs font-bold" key={sim.id}>
                {sim.number}
              </span>,
              sim.operator.name,
              sim.order?.reference ?? "-",
              <StatusBadge key="status" status={sim.status} />,
              sim.commissionApplied
                ? formatMoney(sim.commissionApplied)
                : sim.fineApplied
                  ? formatMoney(-sim.fineApplied)
                  : "Pending",
            ],
          )}
        />
      </div>
    </div>
  );
}
