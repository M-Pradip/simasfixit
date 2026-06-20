import { AccessDenied } from "@/components/admin/access-denied";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { togglePaymentMethodStatus, updatePaymentMethodQr } from "../actions";

export default async function PaymentMethodsPage() {
  const session = await requireAdminSession();
  if (!isPrivilegedAdmin(session.role)) {
    return (
      <AccessDenied message="You do not have permission to view payment methods." />
    );
  }

  const methods = await prisma.paymentMethod.findMany({
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-950">Payment methods</h1>
      <div className="mt-6">
        <DataTable
          headers={["Name", "Type", "Status", "QR", "Note", "Action"]}
          rows={methods.map((method) => [
            method.name,
            method.type,
            <StatusBadge
              key="status"
              status={method.active ? "ACTIVE" : "INACTIVE"}
            />,
            method.type === "ONLINE" ? (
              <form
                key="qr"
                action={updatePaymentMethodQr}
                className="flex min-w-[260px] items-center gap-2"
              >
                <input type="hidden" name="paymentMethodId" value={method.id} />
                {method.qrUrl ? (
                  <img
                    className="h-14 w-14 rounded border border-slate-200 object-contain"
                    src={method.qrUrl}
                    alt={`${method.name} QR`}
                  />
                ) : (
                  <span className="text-xs text-slate-500">No QR</span>
                )}
                <input
                  name="qr"
                  type="file"
                  accept="image/*"
                  className="w-36 text-xs"
                  required
                />
                <button className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">
                  Upload
                </button>
              </form>
            ) : (
              "-"
            ),
            method.note ?? "-",
            <form key="toggle" action={togglePaymentMethodStatus}>
              <input type="hidden" name="paymentMethodId" value={method.id} />
              <input
                type="hidden"
                name="active"
                value={method.active ? "false" : "true"}
              />
              <button
                className={
                  method.active
                    ? "rounded-md border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    : "rounded-md border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                }
              >
                {method.active ? "Deactivate" : "Activate"}
              </button>
            </form>,
          ])}
        />
      </div>
    </div>
  );
}
