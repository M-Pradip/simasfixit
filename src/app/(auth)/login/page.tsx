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
    vendor_password:
      "Incorrect password. Please contact an ASFixit admin to reset your vendor account password.",
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
    <main className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7f9fc_0%,#eef4ff_100%)] px-5 text-slate-900">
      <div className="flex flex-1 items-center justify-center py-12">
        <section className="w-full max-w-sm rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-7">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Sign in
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Enter your phone number and password.
            </p>
          </div>

          {message ? (
            <div
              className={`mt-5 rounded-xl border p-3 text-sm leading-6 ${
                message.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <form
            action="/api/auth/login"
            className="mt-6 grid gap-5"
            method="post"
          >
            <label className="sr-only" htmlFor="identifier">
              Phone number
            </label>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              id="identifier"
              name="identifier"
              placeholder="Phone Number"
              required
              type="text"
            />

            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
            />

            <button
              className="rounded-2xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <Link
            className="mt-6 inline-flex text-base font-semibold text-teal-700 hover:text-teal-800"
            href="/vendor/register"
          >
            Register as a vendor
          </Link>
        </section>
      </div>

      <footer className="pb-6 pt-2 text-center">
        <p className="font-semibold text-slate-700">
          AS Fixit SIM Vendor Portal
        </p>
        <p className="mt-1 text-sm text-slate-500">
          &copy; 2026 AS Fixit Pasal &middot; Developed by Pradip Manandhar
        </p>
      </footer>
    </main>
  );
}
