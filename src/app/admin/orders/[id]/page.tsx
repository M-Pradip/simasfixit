import { AccessDenied } from "@/components/admin/access-denied";
import { AssignSimsButton } from "@/components/admin/orders/assign-sims-button";
import { ChangeOrderStatusButton } from "@/components/admin/orders/change-order-status-button";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
export default async function OrderDetailPage(
  props: PageProps<"/admin/orders/[id]">,
) {
  const session = await requireAdminSession();
  if (!isPrivilegedAdmin(session.role)) {
    return (
      <AccessDenied message="You do not have permission to view order details." />
    );
  }

  const { id } = await props.params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      vendor: true,
      operator: true,
      sims: { orderBy: { number: "asc" }, take: 120 },
      statusEvents: {
        include: { adminUser: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) notFound();

  const unassignedCount = order.quantity - order.sims.length;
  const unassignedSims = await prisma.sim.findMany({
    where: {
      operatorId: order.operatorId,
      status: "ACTIVE",
      orderId: null,
      assignedVendorId: null,
    },
    orderBy: { number: "asc" },
    take: 500,
  });

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            {order.reference}
          </h1>
          <p className="mt-2 text-slate-600">
            {order.vendor.businessName} · {order.operator.name} ·{" "}
            {order.quantity} SIMs
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {unassignedCount > 0 && unassignedSims.length > 0 && (
            <AssignSimsButton
              orderId={order.id}
              requiredCount={unassignedCount}
              unassignedSims={unassignedSims.map((sim) => ({
                id: sim.id,
                number: sim.number,
              }))}
            />
          )}

          <ChangeOrderStatusButton
            orderId={order.id}
            currentStatus={order.status}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-4">
        <div>
          <p className="text-sm text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500">Payment</p>
          <p className="mt-2 font-bold">{order.paymentMethod}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Range</p>
          <p className="mt-2 font-mono text-sm font-bold">
            {order.assignedStartNumber ?? "Not assigned"}
            {order.assignedEndNumber ? `-${order.assignedEndNumber}` : ""}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Commission used</p>
          <p className="mt-2 font-bold">Rs. {order.commissionUsed}</p>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Assigned SIMs ({order.sims.length}/{order.quantity})
        </h2>
        <DataTable
          headers={["SIM", "Status", "Commission", "Fine"]}
          rows={order.sims.map((sim) => [
            <span className="font-mono text-xs font-bold" key={sim.id}>
              {sim.number}
            </span>,
            <StatusBadge key="status" status={sim.status} />,
            sim.commissionApplied ?? "-",
            sim.fineApplied ?? "-",
          ])}
        />
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-950">
          Status audit log
        </h2>
        <DataTable
          headers={["Date", "From", "To", "Admin", "Note"]}
          rows={order.statusEvents.map((event) => [
            event.createdAt.toLocaleDateString(),
            event.fromStatus ?? "-",
            <StatusBadge key="status" status={event.toStatus} />,
            event.adminUser?.name ?? "System",
            event.note ?? "-",
          ])}
        />
      </section>
    </div>
  );
}
