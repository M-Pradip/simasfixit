"use client";

import { useState } from "react";
import { AssignSimsModal } from "./assign-sims-modal";

type SimOption = {
  id: string;
  number: string;
};

export function AssignSimsButton({
  orderId,
  requiredCount,
  unassignedSims,
}: {
  orderId: string;
  requiredCount: number;
  unassignedSims: SimOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600"
      >
        Assign {requiredCount} SIM{requiredCount !== 1 ? "s" : ""}
      </button>
      {isOpen && (
        <AssignSimsModal
          orderId={orderId}
          requiredCount={requiredCount}
          unassignedSims={unassignedSims}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
