"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
        <h1 className="text-3xl font-black text-rose-900">
          Action not allowed
        </h1>
        <p className="mt-3 text-sm text-rose-800">
          {error?.message ??
            "You do not have permission to perform this action."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
