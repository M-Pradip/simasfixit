import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <section className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
          ASFixit SIM Portal
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Distribution, activation outcomes, and Pasal balances.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Use the seeded credentials to enter the admin or vendor portal. Protected routes are
          checked by `src/middleware.ts` through the Next 16 proxy wrapper.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white" href="/admin/login">
            Admin login
          </Link>
          <Link className="rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800" href="/vendor/login">
            Vendor login
          </Link>
        </div>
      </section>
    </main>
  );
}
