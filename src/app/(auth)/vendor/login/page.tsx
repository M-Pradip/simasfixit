import Link from "next/link";

export default function VendorLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <form action="/api/auth/vendor" method="post" className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Vendor portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Sign in as Pasal</h1>
        <p className="mt-2 text-sm text-slate-500">Seeded: 9800000001 / Vendor@12345</p>
        <label className="mt-6 block text-sm font-bold text-slate-700">
          Phone number
          <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" name="phone" defaultValue="9800000001" required />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700">
          Password
          <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" name="password" type="password" defaultValue="Vendor@12345" required />
        </label>
        <button className="mt-6 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-bold text-white" type="submit">
          Login
        </button>
        <Link className="mt-4 block text-center text-sm font-semibold text-slate-500" href="/admin/login">
          Admin login
        </Link>
      </form>
    </main>
  );
}
