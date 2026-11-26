import { z } from "zod";

import { normalizeJobUrl } from "@/domain/jobs";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `At most ${max} characters`)
    .transform((value) => value || null);

export const addToInboxSchema = z
  .object({
    url: z
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
      }),
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
