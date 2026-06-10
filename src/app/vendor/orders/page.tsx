import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { requireVendorSession } from "@/lib/auth";
import { formatNepalDate, nepalDateRange } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function VendorOrdersPage(props: { searchParams: Promise<{ dateFrom?: string; dateTo?: string; status?: string }> }) {
  const session = await requireVendorSession();
  const searchParams = await props.searchParams;
  const dateRange = nepalDateRange(searchParams.dateFrom, searchParams.dateTo);
  const orders = await prisma.order.findMany({
    where: {
      vendorId: session.id,
      ...(dateRange ? { createdAt: dateRange } : {}),
      ...(searchParams.status ? { status: searchParams.status as "PENDING" | "ASSIGNED" | "DISPATCHED" | "DELIVERED" | "CANCELLED" } : {}),
    },
    include: { operator: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">My orders</h1>
      <form className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[180px_180px_180px_auto]">
        <input name="dateFrom" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={searchParams.dateFrom ?? ""} />
        <input name="dateTo" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={searchParams.dateTo ?? ""} />
        <select name="status" className="rounded-md border border-slate-300 px-3 py-2 text-sm" defaultValue={searchParams.status ?? ""}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Filter</button>
      </form>
      <div className="mt-6">
        <DataTable
          headers={["Reference", "Operator", "Qty", "SIM range", "Payment", "Status", "Created", "Delivered"]}
          rows={orders.map((order) => [
            order.reference,
            order.operator.name,
            order.quantity,
            order.assignedStartNumber ? `${order.assignedStartNumber}-${order.assignedEndNumber}` : "Pending assignment",
            order.paymentMethod,
            <StatusBadge key="status" status={order.status} />,
            formatNepalDate(order.createdAt),
            formatNepalDate(order.deliveredAt),
          ])}
        />
      </div>
    </div>
  );
}
