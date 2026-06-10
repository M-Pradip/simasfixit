"use client";

import { assignSimsToOrder } from "@/app/admin/actions";
import { useState } from "react";

type SimOption = {
  id: string;
  number: string;
};

export function AssignSimsModal({
  orderId,
  requiredCount,
  unassignedSims,
  onClose,
}: {
  orderId: string;
  requiredCount: number;
  unassignedSims: SimOption[];
  onClose: () => void;
}) {
  const [selectedSimIds, setSelectedSimIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const filteredSims = unassignedSims.filter((sim) =>
    sim.number.includes(searchQuery.trim()),
  );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSimIds(new Set());
      setSelectAll(false);
    } else {
      const firstN = new Set(
        filteredSims.slice(0, requiredCount).map((s) => s.id),
      );
      setSelectedSimIds(firstN);
      setSelectAll(true);
    }
  };

  const handleToggleSim = (simId: string) => {
    const newSelected = new Set(selectedSimIds);
    if (newSelected.has(simId)) {
      newSelected.delete(simId);
    } else if (newSelected.size < requiredCount) {
      newSelected.add(simId);
    }
    setSelectedSimIds(newSelected);
  };

  const handleSelectRange = (startIndex: number, endIndex: number) => {
    const newSelected = new Set(selectedSimIds);
    const [start, end] =
      startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

    for (let i = start; i <= end && newSelected.size < requiredCount; i++) {
      newSelected.add(filteredSims[i].id);
    }
    setSelectedSimIds(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedSimIds.size === 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("simIds", Array.from(selectedSimIds).join(","));
      await assignSimsToOrder(formData);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to assign SIMs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Assign SIMs to Order
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Select {requiredCount} SIM{requiredCount !== 1 ? "s" : ""} to assign (
          {selectedSimIds.size}/{requiredCount} selected)
        </p>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Search SIM number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSelectAll}
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200"
          >
            {selectAll
              ? "Deselect All"
              : `Select First ${Math.min(requiredCount, filteredSims.length)}`}
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto border border-slate-200 rounded-md p-3">
          {filteredSims.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No unassigned SIMs found
            </p>
          ) : (
            filteredSims.map((sim, index) => (
              <label
                key={sim.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSimIds.has(sim.id)}
                  onChange={() => handleToggleSim(sim.id)}
                  disabled={
                    !selectedSimIds.has(sim.id) &&
                    selectedSimIds.size >= requiredCount
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="font-mono text-sm font-bold">
                  {sim.number}
                </span>
                {index > 0 && filteredSims[index - 1] && (
                  <button
                    onClick={() => handleSelectRange(index - 1, index)}
                    className="ml-auto text-xs text-slate-500 hover:text-slate-700"
                  >
                    Range
                  </button>
                )}
              </label>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedSimIds.size === 0 || isLoading}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300 hover:bg-teal-600"
          >
            {isLoading
              ? "Assigning..."
              : `Assign ${selectedSimIds.size} SIM${selectedSimIds.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
