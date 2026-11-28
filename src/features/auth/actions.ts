"use server";

import { redirect } from "next/navigation";

import { formValues, toFieldErrors } from "@/lib/forms";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

import type { LoginInput, LoginState } from "./schema";
import { loginSchema } from "./schema";

const INVALID_CREDENTIALS = "Invalid email or password";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const { email, password } = formValues(formData, ["email", "password"]);
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors<keyof LoginInput>(parsed.error), email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // One generic message: never reveal whether the email or the password was wrong.
    return { error: INVALID_CREDENTIALS, email };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
