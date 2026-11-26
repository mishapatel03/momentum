import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

const LOGIN_PATH = "/login";

/**
 * Optimistic auth gate: refreshes the session and redirects early.
 * Not the security boundary. Pages and actions verify the user themselves.
 */
export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return redirectWithCookies(request, LOGIN_PATH, response);
  }
  if (isAuthenticated && isLoginPage) {
    return redirectWithCookies(request, "/", response);
  }
  return response;
}

/** Redirect while keeping any refreshed auth cookies from `source`. */
function redirectWithCookies(request: NextRequest, pathname: string, source: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
