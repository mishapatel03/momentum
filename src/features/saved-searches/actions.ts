"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/auth/session";
import { formValues, toFieldErrors } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

import type { SavedSearchField, SavedSearchState } from "./schema";
import { savedSearchSchema } from "./schema";

const UNIQUE_VIOLATION = "23505";

export async function addSavedSearch(
  _prev: SavedSearchState,
  formData: FormData,
): Promise<SavedSearchState> {
  const user = await requireUser();
  const values = formValues(formData, ["label", "url"]);

  const parsed = savedSearchSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<SavedSearchField>(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_searches")
    .insert({ user_id: user.id, ...parsed.data });

  if (error?.code === UNIQUE_VIOLATION) {
    return { status: "error", fieldErrors: { url: "This search is already saved" }, values };
  }
  if (error) {
    console.error("addSavedSearch failed", error);
    return { status: "error", message: "Couldn't save the search. Please try again.", values };
  }

  refresh();
  return { status: "success", message: "Search saved" };
}

export async function deleteSavedSearch(id: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);

  if (error) {
    console.error("deleteSavedSearch failed", error);
    return { ok: false };
  }
  refresh();
  return { ok: true };
}
