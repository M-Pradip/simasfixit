import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(sessionCookieName);
  return response;
}
