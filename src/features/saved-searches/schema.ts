import { z } from "zod";

export const savedSearchSchema = z.object({
  label: z.string().trim().min(1, "Give it a short name").max(60, "At most 60 characters"),
  // Search filters live in the query string, so the URL is kept as-is (no normalization).
  url: z
    .string()
    .trim()
    .max(2048, "That link is too long")
    .refine(isHttpUrl, "Paste the full search link starting with https://"),
});

export type SavedSearchField = keyof z.infer<typeof savedSearchSchema>;

export type SavedSearchState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<SavedSearchField, string>>;
  values?: Record<SavedSearchField, string>;
};

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
