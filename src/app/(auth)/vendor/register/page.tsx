import Link from "next/link";
import { prisma } from "@/lib/prisma";

function registerMessage(error?: string | string[], registered?: string | string[]) {
  const code = Array.isArray(error) ? error[0] : error;
  const success = Array.isArray(registered) ? registered[0] : registered;

  if (success === "1") {
    return {
      tone: "success" as const,
      text:
        "Registration submitted successfully. The ASFixit team will review your documents and activate the account once approved.",
    };
  }

  if (!code) return null;

  const messages: Record<string, string> = {
    missing_contract: "An active contract must be available before registration.",
    duplicate_account:
      "A vendor with this phone number, email, citizenship number, or PAN already exists.",
    invalid_phone: "Enter a valid phone number for the vendor account.",
    password_mismatch: "Passwords do not match.",
    weak_password: "Password must be at least 8 characters long.",
    missing_file: "All required KYC documents and the signed contract must be uploaded.",
    invalid_upload: "One or more uploads were not accepted.",
    invalid_email: "Enter a valid email address or leave it blank.",
  };

  return {
    tone: "error" as const,
    text: messages[code] ?? "Registration could not be completed. Please review the form and try again.",
  };
}

export default async function VendorRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    registered?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const message = registerMessage(params.error, params.registered);
  const activeContract = await prisma.contract.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_36%),linear-gradient(180deg,_#f8fafc,_#e2e8f0_100%)] px-5 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-700">
            Vendor registration
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Create a new vendor profile
          </h1>
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

        <form
          action="/api/auth/vendor/register"
          className="mt-6 grid gap-6"
          encType="multipart/form-data"
          method="post"
        >
          <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Owner name
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="ownerName"
                  placeholder="Full name"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Business name
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="businessName"
                  placeholder="Shop / Pasal name"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Phone number
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="phone"
                  placeholder="9800000001"
                  required
                  type="tel"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Email
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="email"
                  placeholder="optional@email.com"
                  type="email"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
                Full address
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="address"
                  placeholder="Street, area, district, ward"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Citizenship number
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="citizenshipNumber"
                  placeholder="Citizenship / ID number"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                PAN / VAT number
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="panNumber"
                  placeholder="PAN / VAT"
                  required
                />
              </label>
            </div>
          </section>

          <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Password
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  minLength={8}
                  name="password"
                  placeholder="Create a password"
                  required
                  type="password"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Confirm password
                <input
                  className="rounded-2xl border border-slate-300 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  minLength={8}
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  required
                  type="password"
                />
              </label>
            </div>
          </section>

          <section className="grid gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["passportPhoto", "Passport size photo", "image/*,application/pdf"],
                ["citizenshipFront", "Citizenship front", "image/*,application/pdf"],
                ["citizenshipBack", "Citizenship back", "image/*,application/pdf"],
                ["panVat", "Business PAN / VAT", "image/*,application/pdf"],
              ].map(([name, label, accept]) => (
                <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
                  {label}
                  <input
                    className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    accept={accept}
                    name={name}
                    required
                    type="file"
                  />
                </label>
              ))}

              <div className="grid gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-between gap-3">
                  <span>Signed contract copy</span>
                  {activeContract ? (
                    <Link
                      className="font-semibold text-teal-700 hover:text-teal-800"
                      href={activeContract.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download contract
                    </Link>
                  ) : null}
                </div>
                <input
                  className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  name="signedContract"
                  accept="image/*,application/pdf"
                  required
                  type="file"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800">
              Submit registration
            </button>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              href="/login?mode=vendor"
            >
              Back to login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
