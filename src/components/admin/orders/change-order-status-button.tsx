"use client";

import { changeOrderStatus } from "@/app/admin/orders/actions";
import { OrderStatus } from "@prisma/client";
import { useState, useTransition } from "react";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function ChangeOrderStatusButton({ orderId, currentStatus }: Props) {
  const options = ALLOWED_TRANSITIONS[currentStatus];
  const [selected, setSelected] = useState<OrderStatus | "">(
    options.length === 1 ? options[0] : "",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Locked — no further transitions
  if (!options.length) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        Status locked
      </span>
    );
  }

  function handleConfirm() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await changeOrderStatus(
        orderId,
        currentStatus,
        selected as OrderStatus,
        note,
      );
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as OrderStatus)}
          disabled={isPending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
        >
          {options.length > 1 && (
            <option value="" disabled>
              Select new status…
            </option>
          )}
          {options.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          onClick={handleConfirm}
          disabled={!selected || isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Updating…" : "Confirm"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={isPending}
        className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
      />

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
