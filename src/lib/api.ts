import { NextResponse } from "next/server";
import { getCurrentSession, isPrivilegedAdmin } from "@/lib/auth";

export async function requireAdminApi() {
  const session = await getCurrentSession();

  if (!session || session.kind !== "admin") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session };
}

export async function requireManagerApi() {
  const result = await requireAdminApi();

  if ("error" in result) {
    return result;
  }

  if (!isPrivilegedAdmin(result.session.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return result;
}

export async function requireVendorApi() {
  const session = await getCurrentSession();

  if (!session || session.kind !== "vendor") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session };
}
