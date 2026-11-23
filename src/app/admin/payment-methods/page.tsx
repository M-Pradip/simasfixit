import { AccessDenied } from "@/components/admin/access-denied";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { isPrivilegedAdmin, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPaymentMethod,
  togglePaymentMethodStatus,
  updatePaymentMethodQr,
} from "../actions";

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
      <p className="mt-2 text-sm text-slate-600">QR images must be JPG, PNG, or WebP and no larger than 5 MB.</p>
      <form
        action={createPaymentMethod}
        className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_180px_1fr_auto] md:items-end"
      >
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Name
          <input
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Cash on delivery"
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Type
          <select
            name="type"
            defaultValue="COD"
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          >
            <option value="COD">Cash on delivery</option>
            <option value="ONLINE">Online payment</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Note <span className="font-normal text-slate-500">(optional)</span>
          <input
            name="note"
            maxLength={500}
            placeholder="Payment instructions"
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
          Create payment method
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-4">
          <input type="checkbox" name="active" defaultChecked />
          Active and available to vendors
        </label>
      </form>
      <div className="mt-6">
        <DataTable
          pagination
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
                  accept="image/jpeg,image/png,image/webp"
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
