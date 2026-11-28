import "server-only";

import { requireUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";

export type Answer = { id: string; label: string; body: string };

export async function getAnswers(): Promise<Answer[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("answers")
    .select("id, label, body")
    .eq("user_id", user.id)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return data;
}
