import { z } from "zod";

import { JOB_PLATFORMS, normalizeJobUrl } from "@/domain/jobs";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `At most ${max} characters`)
    .transform((value) => value || null);

/** Empty → null; otherwise a normalized http(s) link. */
const optionalJobUrl = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (!value) return null;
    const normalized = normalizeJobUrl(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Enter a full link starting with https://" });
      return z.NEVER;
    }
    if (normalized.length > 2048) {
      ctx.addIssue({ code: "custom", message: "That link is too long" });
      return z.NEVER;
    }
    return normalized;
  });

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `Enter the ${label}`).max(max, `At most ${max} characters`);

export const addToInboxSchema = z
  .object({
    url: optionalJobUrl,
    title: optionalText(200),
    company: optionalText(200),
  })
  .refine((value) => value.url !== null || value.title !== null, {
    path: ["url"],
    message: "Paste a link or enter a title",
  });

export type AddToInboxField = "url" | "title" | "company";

export type AddToInboxState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AddToInboxField, string>>;
  values?: Record<AddToInboxField, string>;
};

export const jobIdSchema = z.uuid();

/** Details confirmed when an inbox job is marked as applied. */
export const markAppliedSchema = z.object({
  title: requiredText("job title", 200),
  company: requiredText("company", 200),
  platform: z.enum(JOB_PLATFORMS, { error: "Pick a platform" }),
});

/** A job applied to directly, without saving it to the inbox first. */
export const addAppliedJobSchema = markAppliedSchema.extend({ url: optionalJobUrl });

export type AppliedField = "title" | "company" | "platform" | "url";

export type AppliedFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AppliedField, string>>;
  values?: Partial<Record<AppliedField, string>>;
};
