import { redirect } from "next/navigation";

export default async function AdminLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[];
    registered?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.error) {
    query.set(
      "error",
      Array.isArray(params.error) ? params.error[0] : params.error,
    );
  }

  if (params.registered) {
    query.set(
      "registered",
      Array.isArray(params.registered)
        ? params.registered[0]
        : params.registered,
    );
  }

  redirect(query.toString() ? `/login?${query.toString()}` : "/login");
}
