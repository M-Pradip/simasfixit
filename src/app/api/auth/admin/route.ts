import { encryptSession, sessionCookieName } from "@/lib/auth";
import { publicUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(
    formData.get("email") ?? formData.get("identifier") ?? "",
  )
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
      publicUrl(request, "/admin/login?error=invalid"),
      303,
    );
  }

  const token = await encryptSession({
    id: user.id,
    name: user.name,
    kind: "admin",
    role: user.role,
  });
  const response = NextResponse.redirect(publicUrl(request, "/admin"), 303);

  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
