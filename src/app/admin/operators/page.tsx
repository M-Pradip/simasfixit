import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { toggleOperatorStatus, updateOperatorDefaults } from "../actions";

export default async function OperatorsPage() {
  const operators = await prisma.operator.findMany({ include: { _count: { select: { sims: true, orders: true } } }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Operator management</h1>
      <p className="mt-2 text-slate-600">Only one operator needs to be active now; all records are already operator-tagged.</p>
      <div className="mt-6">
        <DataTable
          headers={["Operator", "Default commission", "Default fine", "Status", "SIMs", "Orders", "Action"]}
          rows={operators.map((operator) => [
            <span className="font-bold text-slate-950" key={operator.id}>{operator.name}</span>,
            <form key="commission" action={updateOperatorDefaults} className="flex min-w-[220px] items-center gap-2">
              <input type="hidden" name="operatorId" value={operator.id} />
              <input name="defaultCommission" type="number" min="0" defaultValue={operator.defaultCommission} className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="defaultFine" type="hidden" value={operator.defaultFine} />
              <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">Update</button>
            </form>,
            <form key="fine" action={updateOperatorDefaults} className="flex min-w-[220px] items-center gap-2">
              <input type="hidden" name="operatorId" value={operator.id} />
              <input name="defaultCommission" type="hidden" value={operator.defaultCommission} />
              <input name="defaultFine" type="number" min="0" defaultValue={operator.defaultFine} className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">Update</button>
            </form>,
            <StatusBadge key="status" status={operator.status} />,
            operator._count.sims,
            operator._count.orders,
            <form key="toggle" action={toggleOperatorStatus}>
              <input type="hidden" name="operatorId" value={operator.id} />
              <input type="hidden" name="status" value={operator.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} />
              <button className={operator.status === "ACTIVE" ? "rounded-md border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" : "rounded-md border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"}>
                {operator.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </form>,
          ])}
        />
      </div>
    </div>
  );
}
