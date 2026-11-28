import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/safe-redirect";
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
    // Remember where the user was going (e.g. a shared job link), to return after login.
    const next = request.nextUrl.pathname + request.nextUrl.search;
    return redirectWithCookies(request, LOGIN_PATH, response, next === "/" ? undefined : next);
  }
  if (isAuthenticated && isLoginPage) {
    return redirectWithCookies(
      request,
      safeNextPath(request.nextUrl.searchParams.get("next")),
      response,
    );
  }
  return response;
}

/** Redirect while keeping any refreshed auth cookies from `source`. */
function redirectWithCookies(
  request: NextRequest,
  target: string,
  source: NextResponse,
  next?: string,
) {
  const url = new URL(target, request.nextUrl.origin);
  if (next) url.searchParams.set("next", next);
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    // Everything except Next.js internals, static files and public app files (robots, PWA manifest).
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
