import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

/**
 * The real auth check. Call it in every protected page, layout and server action.
 * Verifies the JWT (not just reads the cookie) and redirects to /login if invalid.
 */
export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    redirect("/login");
  }

  return { id: claims.sub, email: claims.email ?? "" };
}
