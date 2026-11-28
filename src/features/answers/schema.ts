import { z } from "zod";

export const LABEL_MAX = 100;
export const BODY_MAX = 5000;

export const answerSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Give it a short title")
    .max(LABEL_MAX, `At most ${LABEL_MAX} characters`),
  body: z
    .string()
    .trim()
    .min(1, "Write the answer")
    .max(BODY_MAX, `At most ${BODY_MAX} characters`),
});

export type AnswerField = keyof z.infer<typeof answerSchema>;

export type AnswerFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AnswerField, string>>;
  values?: Record<AnswerField, string>;
};

/** A starter set for the empty state. Placeholders in [brackets] are meant to be edited. */
export const STARTER_ANSWERS: readonly { label: string; body: string }[] = [
  {
    label: "Tell me about yourself",
    body: "I'm a [role] with [X] years of experience in [stack/domain]. Most recently at [company], I [biggest achievement with a number]. I'm looking for [what you want next] where I can [impact you want to have].",
  },
  {
    label: "Why this company?",
    body: "I've been following [company] because of [product/mission detail]. The [team/problem] stood out to me, and my experience with [relevant skill] fits well with [what they're building].",
  },
  {
    label: "Notice period",
    body: "My notice period is [X weeks/days]. I can start on [date], and I'm open to discussing an earlier date if needed.",
  },
  {
    label: "Salary expectations",
    body: "Based on the role and my experience, I'm looking for [range] [currency] [per year], and I'm open to discussing the full package.",
  },
  {
    label: "Why are you leaving?",
    body: "I've learned a lot at [current company], especially [skill/experience]. I'm now looking for [growth area / scope / domain] that my current role can't offer.",
  },
];
