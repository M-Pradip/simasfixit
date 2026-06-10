import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookieName = "asfixit_session";

export type SessionKind = "admin" | "vendor";

export type AppSession = {
  id: string;
  name: string;
  kind: SessionKind;
  role?: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: AppSession) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function decryptSession(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.id !== "string" ||
      typeof payload.name !== "string" ||
      (payload.kind !== "admin" && payload.kind !== "vendor")
    ) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      kind: payload.kind,
      role: typeof payload.role === "string" ? payload.role : undefined,
    } satisfies AppSession;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(sessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session || session.kind !== "admin") {
    redirect("/admin/login");
  }

  return session;
}

export async function requireVendorSession() {
  const session = await getCurrentSession();

  if (!session || session.kind !== "vendor") {
    redirect("/vendor/login");
  }

  return session;
}

export function isPrivilegedAdmin(role?: string) {
  return role === "SUPERADMIN" || role === "MANAGER";
}
