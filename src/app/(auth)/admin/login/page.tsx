import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
      <form action="/api/auth/admin" method="post" className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">Admin portal</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Sign in to operations</h1>
        <p className="mt-2 text-sm text-slate-500">Seeded: admin@asfixit.com / Admin@12345</p>
        <label className="mt-6 block text-sm font-bold text-slate-700">
          Email
          <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" name="email" type="email" defaultValue="admin@asfixit.com" required />
        </label>
        <label className="mt-4 block text-sm font-bold text-slate-700">
          Password
          <input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2" name="password" type="password" defaultValue="Admin@12345" required />
        </label>
        <button className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white" type="submit">
          Login
        </button>
        <Link className="mt-4 block text-center text-sm font-semibold text-slate-500" href="/vendor/login">
          Vendor login
        </Link>
      </form>
    </main>
  );
}
