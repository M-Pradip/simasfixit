import Link from "next/link";

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-700">
      <h1 className="text-3xl font-black">Access denied</h1>
      <p className="mt-2 text-base">
        {message ?? "You do not have permission to access this page."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
