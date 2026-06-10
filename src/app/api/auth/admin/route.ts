import { encryptSession, sessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.active ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid", request.url),
      303,
    );
  }

  const token = await encryptSession({
    id: user.id,
    name: user.name,
    kind: "admin",
    role: user.role,
  });
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);

  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
