import type { AppSession } from "@/lib/auth";
import Link from "next/link";

export function AdminHeader({ session }: { session: AppSession }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
      <div>
        <p className="text-sm text-slate-500">Signed in as</p>
        <h1 className="text-lg font-bold text-slate-950">{session.name}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
          {session.role}
        </span>
        <a
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
          href="/api/auth/logout"
        >
          Logout
        </a>
      </div>
    </header>
  );
}
