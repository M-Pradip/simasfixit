import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatNepalDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { addContract, toggleContractStatus } from "../actions";

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({ include: { _count: { select: { signedBy: true } } }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Contracts</h1>
      <p className="mt-2 text-slate-600">Current contract can be replaced; each vendor stores the version they signed.</p>
      <form action={addContract} className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[180px_1fr_auto_auto]">
        <input name="version" className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Version" required />
        <input name="contract" type="file" accept="application/pdf,image/*" className="rounded-md border border-slate-300 px-3 py-2 text-sm" required />
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <input name="active" type="checkbox" className="h-4 w-4" />
          Active
        </label>
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Add Contract</button>
      </form>
      <div className="mt-6">
        <DataTable
          headers={["Version", "File", "Active", "Signed by", "Created", "Action"]}
          rows={contracts.map((contract) => [
            contract.version,
            <a className="font-bold text-teal-700 hover:underline" href={contract.fileUrl} key="file" target="_blank">Open file</a>,
            <StatusBadge key="status" status={contract.active ? "ACTIVE" : "INACTIVE"} />,
            contract._count.signedBy,
            formatNepalDate(contract.createdAt),
            <form key="toggle" action={toggleContractStatus}>
              <input type="hidden" name="contractId" value={contract.id} />
              <input type="hidden" name="active" value={contract.active ? "false" : "true"} />
              <button className={contract.active ? "rounded-md border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50" : "rounded-md border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"}>
                {contract.active ? "Deactivate" : "Activate"}
              </button>
            </form>,
          ])}
        />
      </div>
    </div>
  );
}
