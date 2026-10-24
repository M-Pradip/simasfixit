"use client";

import { createVendorOrder } from "@/app/vendor/actions";
import { useMemo, useState } from "react";

type OperatorOption = {
  id: string;
  name: string;
  simCost: number;
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
  balancePoints,
  operators,
  paymentMethods,
}: {
  blocked: boolean;
  maxCommission: number;
  balancePoints: number;
  operators: OperatorOption[];
  paymentMethods: PaymentMethodOption[];
}) {
  const [paymentMethodId, setPaymentMethodId] = useState(
    paymentMethods[0]?.id ?? "",
  );
  const [operatorId, setOperatorId] = useState(operators[0]?.id ?? "");
  const [quantity, setQuantity] = useState(25);
  const [commissionUsed, setCommissionUsed] = useState("0");
  const selectedOperator = operators.find((operator) => operator.id === operatorId);
  const subtotal = (selectedOperator?.simCost ?? 0) * quantity;
  const maxPoints = Math.min(balancePoints, subtotal);
  const enteredPoints = Number(commissionUsed) || 0;
  const pointsUsed = Math.min(Math.max(enteredPoints, 0), maxPoints);
  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethodId),
    [paymentMethodId, paymentMethods],
  );

  return (
    <form
      action={createVendorOrder}
      encType="multipart/form-data"
    className="mt-6 grid gap-6 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-5"
    >
      <div className="md:col-span-3 flex flex-col gap-4">
        <label className="text-sm font-bold text-slate-700">
          Operator
          <select
            name="operatorId"
            value={operatorId}
            onChange={(event) => setOperatorId(event.target.value)}
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
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            min={1}
            type="number"
            disabled={blocked}
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
        {selectedPaymentMethod?.type === "ONLINE" && (
          <label className="text-sm font-bold text-slate-700">
            Payment screenshot <span className="font-normal text-slate-500">(optional, JPG/PNG/WebP, up to 5 MB)</span>
            <input
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-normal"
              type="file"
              name="paymentScreenshot"
              accept="image/jpeg,image/png,image/webp"
              disabled={blocked}
            />
          </label>
        )}
        <label className="text-sm font-bold text-slate-700">
          Balance points (Rs.)
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            disabled={blocked}
            value={commissionUsed}
            onChange={(event) => setCommissionUsed(event.target.value)}
            min={0}
            max={maxPoints}
            type="number"
          />
          <input type="hidden" name="commissionUsed" value={pointsUsed} />
          <span className="mt-1 block text-xs font-normal text-slate-500">Available: Rs. {balancePoints.toLocaleString("en-IN")}</span>
        </label>
        <button
          disabled={blocked || !operators.length || !paymentMethods.length}
          className="rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300 w-full"
        >
          Submit order
        </button>
      </div>

      <aside className="h-fit rounded-lg border border-slate-200 bg-slate-50 p-5 md:col-span-2">
        <h2 className="text-lg font-black text-slate-950">Order summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3 text-slate-600"><span>SIM price</span><span>Rs. {(selectedOperator?.simCost ?? 0).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between gap-3 text-slate-600"><span>Quantity</span><span>{quantity}</span></div>
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 font-bold text-slate-800"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between gap-3 text-emerald-700"><span>Balance points</span><span>- Rs. {pointsUsed.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between gap-3 border-t border-slate-300 pt-3 text-base font-black text-slate-950"><span>Final amount to pay</span><span>Rs. {Math.max(0, subtotal - pointsUsed).toLocaleString("en-IN")}</span></div>
        </div>
        {selectedPaymentMethod?.type === "ONLINE" && (
          <div className="mt-5 border-t border-slate-200 pt-4 text-center">
            <p className="text-sm font-bold text-slate-800">Active payment QR</p>
            {selectedPaymentMethod.qrUrl ? (
              <img
                className="mx-auto mt-3 h-auto w-full max-w-xs rounded-md border border-white bg-white object-contain p-2"
                src={selectedPaymentMethod.qrUrl}
                alt={`${selectedPaymentMethod.name} payment QR`}
              />
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                QR has not been uploaded yet for this online method.
              </p>
            )}
          </div>
        )}
      </aside>
    </form>
  );
}
