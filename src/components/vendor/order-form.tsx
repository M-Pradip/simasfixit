"use client";

import { createVendorOrder } from "@/app/vendor/actions";
import { useMemo, useState } from "react";

type OperatorOption = {
  id: string;
  name: string;
};

type PaymentMethodOption = {
  id: string;
  name: string;
  type: "COD" | "ONLINE";
  qrUrl: string | null;
};

export function OrderForm({
  blocked,
  maxCommission,
  operators,
  paymentMethods,
}: {
  blocked: boolean;
  maxCommission: number;
  operators: OperatorOption[];
  paymentMethods: PaymentMethodOption[];
}) {
  const [paymentMethodId, setPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? "",
  );
  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethodId),
    [paymentMethodId, paymentMethods],
  );

  return (
    <form
      action={createVendorOrder}
      className="mt-6 grid gap-6 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-3"
    >
      <div className="md:col-span-2 flex flex-col gap-4">
        <label className="text-sm font-bold text-slate-700">
          Operator
          <select
            name="operatorId"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            disabled={blocked}
            required
          >
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Quantity
          <input
            name="quantity"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            min={1}
            type="number"
            disabled={blocked}
            defaultValue={25}
            required
          />
        </label>
        <label className="text-sm font-bold text-slate-700">
          Payment method
          <select
            name="paymentMethodId"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            disabled={blocked}
            value={paymentMethodId}
            onChange={(event) => setPaymentMethodId(event.target.value)}
            required
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-700">
          Use commission balance
          <input
            name="commissionUsed"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            disabled={blocked}
            defaultValue="0"
            min={0}
            max={maxCommission}
            type="number"
          />
        </label>
        <button
          disabled={blocked || !operators.length || !paymentMethods.length}
          className="rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300 w-full"
        >
          Submit order
        </button>
      </div>

      {selectedPaymentMethod?.type === "ONLINE" && (
        <div className="rounded-md border border-teal-100 bg-teal-50 p-4 md:col-span-1 flex flex-col items-center justify-start">
          <p className="text-sm font-bold text-slate-800">Active payment QR</p>
          {selectedPaymentMethod.qrUrl ? (
            <img
              className="mt-3 w-full h-auto max-w-xs rounded-md border border-white bg-white object-contain p-2"
              src={selectedPaymentMethod.qrUrl}
              alt={`${selectedPaymentMethod.name} payment QR`}
            />
          ) : (
            <p className="mt-2 text-sm text-slate-600 text-center">
              QR has not been uploaded yet for this online method.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
