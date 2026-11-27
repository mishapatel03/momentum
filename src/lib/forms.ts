import type { z } from "zod";

/** First error message per field, for showing next to inputs. */
export function toFieldErrors<Field extends string>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const fieldErrors: Partial<Record<Field, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") fieldErrors[field as Field] ??= issue.message;
  }
  return fieldErrors;
}

/** Raw string values from a form, so inputs can be refilled after React resets the form. */
export function formValues<Field extends string>(
  formData: FormData,
  fields: readonly Field[],
): Record<Field, string> {
  const values = {} as Record<Field, string>;
  for (const field of fields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}
