import { StatCard } from "@/components/stat-card";
import { OrderForm } from "@/components/vendor/order-form";
import { requireVendorSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export default async function NewOrderPage() {
  const session = await requireVendorSession();
  const [vendor, operators, paymentMethods] = await Promise.all([
    prisma.vendor.findUniqueOrThrow({ where: { id: session.id } }),
    prisma.operator.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
  ]);
  const blocked = vendor.balance < 0;

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">
            Place new SIM order
          </h1>
          <p className="mt-2 text-slate-600">
            Vendors order quantity only; admin assigns exact SIM numbers after
            submission.
          </p>
        </div>
        <div className="md:w-72">
          <StatCard
            label="Current balance"
            value={formatMoney(vendor.balance)}
            note={
              vendor.balance < 0
                ? "Must be cleared"
                : "Available balance for ordering"
            }
          />
        </div>
      </div>
      {blocked && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="font-bold">New orders disabled</p>
          <p className="mt-1 text-sm">
            Current balance is {formatMoney(vendor.balance)}. Admin must record
            settlement before order acceptance.
          </p>
        </div>
      )}
      <OrderForm
        blocked={blocked}
        maxCommission={Math.max(vendor.balance, 0)}
        operators={operators}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
