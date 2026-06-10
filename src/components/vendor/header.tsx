import type { AppSession } from "@/lib/auth";
import Link from "next/link";

export function VendorHeader({ session }: { session: AppSession }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
      <div>
        <p className="text-sm text-slate-500">Pasal account</p>
        <h1 className="text-lg font-bold text-slate-950">{session.name}</h1>
      </div>
      <a
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
        href="/api/auth/logout"
      >
        Logout
      </a>
    </header>
  );
}
