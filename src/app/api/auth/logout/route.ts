import { sessionCookieName } from "@/lib/auth";
import { publicUrl } from "@/lib/base-url";
import { NextResponse, type NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(publicUrl(request, "/"), 303);
  response.cookies.delete(sessionCookieName);
  return response;
}
