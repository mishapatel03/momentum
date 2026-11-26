import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { getPublicEnv } from "@/lib/env";

import type { Database } from "./database.types";

/** Supabase client for Server Components, Server Actions and Route Handlers. Create one per request. */
export async function createClient() {
  // Wait for a real request before anything else: auth reads cookies and checks token
  // expiry against the clock, neither of which may run during prerendering.
  await connection();
  const cookieStore = await cookies();
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = getPublicEnv();

  return createServerClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies. Safe to ignore:
            // the proxy refreshes the session on every request.
          }
        },
      },
    },
  );
}
