import { AccessDenied } from "@/components/admin/access-denied";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { processSimSearch, processSimStatus } from "../actions";

export default async function ApprovalPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdminSession();
  if (!isPrivilegedAdmin(session.role)) {
    return (
      <AccessDenied message="You do not have permission to view SIM approval." />
    );
  }

  const { q } = await props.searchParams;
  const query = q?.trim();
  const sims = await prisma.sim.findMany({
    where: {
      assignedVendorId: { not: null },
      ...(query ? { number: { contains: query } } : {}),
    },
    include: { assignedVendor: true, order: true, operator: true },
    orderBy: { updatedAt: "desc" },
    take: 40,
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">
        SIM approval / rejection
      </h1>
      <p className="mt-2 text-slate-600">
        Search a SIM number, then approve or reject assigned SIMs. Approved SIMs
        are locked.
      </p>
      <form
        action={processSimSearch}
        className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-[1fr_auto]"
      >
        <input
          name="number"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search SIM number"
          defaultValue={query}
        />
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          Search
        </button>
      </form>
      <div className="mt-6">
        <DataTable
          headers={[
            "SIM",
            "Vendor",
            "Order",
            "Operator",
            "Status",
            "Ledger impact",
            "Change status",
          ]}
          rows={sims.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sim: any) => [
              <span className="font-mono text-xs font-bold" key={sim.id}>
                {sim.number}
              </span>,
              sim.assignedVendor?.businessName ?? "-",
              sim.order?.reference ?? "-",
              sim.operator.name,
              <StatusBadge key="status" status={sim.status} />,
              sim.commissionApplied
                ? formatMoney(sim.commissionApplied)
                : sim.fineApplied
                  ? formatMoney(-sim.fineApplied)
                  : "Pending",
              sim.status === "APPROVED" ? (
                <span key="locked" className="text-xs font-bold text-slate-500">
                  Locked after approval
                </span>
              ) : (
                <form
                  key="actions"
                  action={processSimStatus}
                  className="grid min-w-[280px] gap-2"
                >
                  <input type="hidden" name="simId" value={sim.id} />
                  <input
                    name="note"
                    className="rounded-md border border-slate-300 px-3 py-2 text-xs"
                    placeholder="Note for ledger"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      name="status"
                      value="APPROVED"
                      className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600"
                    >
                      Approve
                    </button>
                    {sim.status !== "REJECTED" && (
                      <button
                        name="status"
                        value="REJECTED"
                        className="rounded-md bg-rose-700 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </form>
              ),
            ],
          )}
        />
      </div>
    </div>
  );
}
