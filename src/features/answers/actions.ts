"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/auth/session";
import { formValues, toFieldErrors } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

import type { AnswerField, AnswerFormState } from "./schema";
import { answerSchema, STARTER_ANSWERS } from "./schema";

const idSchema = z.uuid();
type Result = { ok: true } | { ok: false; message: string };
const FAILED = "Something went wrong. Please try again.";

/** Creates an answer, or updates one when `answerId` is given. New answers go to the end. */
export async function saveAnswer(
  answerId: string | null,
  _prev: AnswerFormState,
  formData: FormData,
): Promise<AnswerFormState> {
  const user = await requireUser();
  const values = formValues(formData, ["label", "body"]);
  const parsed = answerSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors<AnswerField>(parsed.error), values };
  }

  const supabase = await createClient();

  if (answerId) {
    const id = idSchema.safeParse(answerId);
    if (!id.success) return { status: "error", message: "Invalid answer", values };
    const { data, error } = await supabase
      .from("answers")
      .update(parsed.data)
      .eq("id", id.data)
      .eq("user_id", user.id)
      .select("id");
    if (error) {
      console.error("saveAnswer: update failed", error);
      return { status: "error", message: FAILED, values };
    }
    if (data.length === 0) return { status: "error", message: "That answer no longer exists." };
  } else {
    const { data: last, error: readError } = await supabase
      .from("answers")
      .select("sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = readError
      ? { error: readError }
      : await supabase
          .from("answers")
          .insert({ user_id: user.id, ...parsed.data, sort_order: (last?.sort_order ?? -1) + 1 });
    if (error) {
      console.error("saveAnswer: insert failed", error);
      return { status: "error", message: FAILED, values };
    }
  }

  refresh();
  return { status: "success", message: answerId ? "Answer updated" : "Answer added" };
}

export async function deleteAnswer(answerId: string): Promise<Result> {
  const user = await requireUser();
  const id = idSchema.safeParse(answerId);
  if (!id.success) return { ok: false, message: "Invalid answer" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("answers")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id);
  if (error) {
    console.error("deleteAnswer failed", error);
    return { ok: false, message: FAILED };
  }
  refresh();
  return { ok: true };
}

/** Moves an answer one place up or down, renumbering the list so the order stays clean. */
export async function moveAnswer(answerId: string, direction: "up" | "down"): Promise<Result> {
  const user = await requireUser();
  const id = idSchema.safeParse(answerId);
  if (!id.success) return { ok: false, message: "Invalid answer" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("answers")
    .select("id")
    .eq("user_id", user.id)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("moveAnswer: read failed", error);
    return { ok: false, message: FAILED };
  }

  const ids = data.map((row) => row.id);
  const from = ids.indexOf(id.data);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= ids.length) return { ok: true }; // already at the edge
  [ids[from], ids[to]] = [ids[to]!, ids[from]!];

  const results = await Promise.all(
    ids.map((rowId, index) =>
      supabase.from("answers").update({ sort_order: index }).eq("id", rowId).eq("user_id", user.id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    console.error("moveAnswer: update failed", failed.error);
    return { ok: false, message: FAILED };
  }
  refresh();
  return { ok: true };
}

/** Adds the starter set. Only when the list is empty, so a double tap can't duplicate it. */
export async function addStarterAnswers(): Promise<Result> {
  const user = await requireUser();
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) {
    console.error("addStarterAnswers: count failed", countError);
    return { ok: false, message: FAILED };
  }
  if ((count ?? 0) > 0) return { ok: true };

  const { error } = await supabase
    .from("answers")
    .insert(
      STARTER_ANSWERS.map((answer, index) => ({ user_id: user.id, ...answer, sort_order: index })),
    );
  if (error) {
    console.error("addStarterAnswers failed", error);
    return { ok: false, message: FAILED };
  }
  refresh();
  return { ok: true };
}
