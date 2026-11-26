import "server-only";

import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SavedSearch = { id: string; label: string; url: string };

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, label, url")
    .eq("user_id", user.id)
    .order("sort_order")
    .order("created_at");

  if (error) throw error;
  return data;
}
