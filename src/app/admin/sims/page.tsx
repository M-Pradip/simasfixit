import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatMoney, nepalDateRange } from "@/lib/utils";
import { addSimRange, addSingleSim } from "../actions";

export default async function SimsPage(props: {
  searchParams: Promise<{
    operatorId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    q?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const dateRange = nepalDateRange(searchParams.dateFrom, searchParams.dateTo);
  const [operators, sims] = await Promise.all([
    prisma.operator.findMany({ orderBy: { name: "asc" } }),
    prisma.sim.findMany({
      where: {
        ...(searchParams.operatorId
          ? { operatorId: searchParams.operatorId }
          : {}),
        ...(searchParams.status
          ? {
              status: searchParams.status as
                | "ACTIVE"
                | "ASSIGNED"
                | "APPROVED"
                | "REJECTED",
            }
          : {}),
        ...(searchParams.q
          ? { number: { contains: searchParams.q.trim() } }
          : {}),
        ...(dateRange ? { createdAt: dateRange } : {}),
      },
      include: { operator: true, assignedVendor: true, order: true },
      orderBy: { number: "asc" },
      take: 500,
    }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">SIM inventory</h1>
      <p className="mt-2 text-slate-600">
        Add one SIM number or create a bulk range for the selected operator.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-bold text-slate-700">
            Add Single SIM
          </p>
          <form
            action={addSingleSim}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 grid-cols-[1fr_auto]"
          >
            <input
              name="number"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Single SIM number"
              required
            />
            <select
              name="operatorId"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              defaultValue={operators[0]?.id}
              required
            >
              {operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 md:col-span-2">
              Add Single SIM
            </button>
          </form>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-slate-700">
            Add SIM Range (Bulk)
          </p>
          <form
            action={addSimRange}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 grid-cols-[1fr_1fr_auto]"
          >
            <input
              name="startNumber"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Start range"
              required
            />
            <input
              name="endNumber"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="End range"
              required
            />
            <select
              name="operatorId"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              defaultValue={operators[0]?.id}
              required
            >
              {operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name}
                </option>
              ))}
            </select>
            <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 md:col-span-3">
              Add SIM Range
            </button>
          </form>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_180px_160px_160px_auto]">
        <input
          name="q"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search SIM number"
          defaultValue={searchParams.q ?? ""}
        />
        <select
          name="operatorId"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          defaultValue={searchParams.operatorId ?? ""}
        >
          <option value="">All operators</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          defaultValue={searchParams.status ?? ""}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            name="dateFrom"
            type="date"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={searchParams.dateFrom ?? ""}
          />
          <input
            name="dateTo"
            type="date"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={searchParams.dateTo ?? ""}
          />
        </div>
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
          Filter
        </button>
      </form>

      <div className="mt-6">
        <DataTable
          maxHeight="680px"
          headers={[
            "SIM",
            "Operator",
            "Status",
            "Vendor",
            "Order",
            "Commission/Fine",
          ]}
          rows={sims.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sim: any) => [
              <span className="font-mono text-xs font-bold" key={sim.id}>
                {sim.number}
              </span>,
              sim.operator.name,
              <StatusBadge key="status" status={sim.status} />,
              sim.assignedVendor?.businessName ?? "Unassigned",
              sim.order?.reference ?? "-",
              sim.commissionApplied
                ? formatMoney(sim.commissionApplied)
                : sim.fineApplied
                  ? formatMoney(-sim.fineApplied)
                  : "-",
            ],
          )}
        />
      </div>
    </div>
  );
}
