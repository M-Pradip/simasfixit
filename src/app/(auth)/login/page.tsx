import { getCurrentSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

function messageFromQuery(
  error?: string | string[],
  registered?: string | string[],
) {
  const code = Array.isArray(error) ? error[0] : error;
  const success = Array.isArray(registered) ? registered[0] : registered;

  if (success === "1") {
    return {
      tone: "success" as const,
      text: "Your vendor registration has been submitted. Sign in once ASFixit approves your account.",
    };
  }

  if (!code) return null;

  const messages: Record<string, string> = {
    invalid:
      "We could not verify those credentials. Please check the identifier and password.",
    pending:
      "Your vendor account is waiting for approval. Try again after the review is completed.",
  };

  return {
    tone: "error" as const,
    text:
      messages[code] ??
      "Sign in failed. Please verify your details and try again.",
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    registered?: string | string[];
  }>;
}) {
  const session = await getCurrentSession();
  if (session?.kind === "admin") {
    redirect("/admin");
  }
  if (session?.kind === "vendor") {
    redirect("/vendor");
  }

  const params = await searchParams;
  const message = messageFromQuery(params.error, params.registered);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_38%),linear-gradient(180deg,_#0f172a,_#f8fafc_18%,_#ffffff_100%)] px-5 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 justify-center items-center gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-700">
              Sign in
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Access your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your email or phone number, then sign in.
            </p>
          </div>

          {message ? (
            <div
              className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <form action="/api/auth/login" className="mt-6 grid gap-4" method="post">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email or phone number
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                name="identifier"
                placeholder="admin@asfixit.com or 9800000001"
                required
                type="text"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password
              <input
                className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </label>

            <button
              className="rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link
              className="font-semibold text-teal-700 hover:text-teal-800"
              href="/vendor/register"
            >
              Register as vendor
            </Link>
            <div className="text-sm text-slate-500">
              Need help? Contact ASFixit operations.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
