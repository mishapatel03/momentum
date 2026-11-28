"use client";

import { useActionState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { JOB_PLATFORMS } from "@/domain/jobs";

import { updateJob } from "../actions";
import { PLATFORM_LABELS } from "../labels";
import type { JobDetails } from "../queries";
import type { EditJobState } from "../schema";

const initialState: EditJobState = { status: "idle" };

export function JobDetailsForm({ job }: { job: JobDetails }) {
  const action = useMemo(() => updateJob.bind(null, job.id), [job.id]);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const inPipeline = job.status !== "inbox";

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  const errors = state.fieldErrors;
  // After a submit, show what was submitted; React resets the form to these defaults.
  const values = state.values ?? {
    title: job.title ?? "",
    company: job.company ?? "",
    url: job.url ?? "",
    platform: job.platform,
    notes: job.notes ?? "",
  };

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-title">Job title{!inPipeline && " (optional)"}</Label>
          <Input
            id="job-title"
            name="title"
            defaultValue={values.title}
            aria-invalid={Boolean(errors?.title)}
            aria-describedby="job-title-error"
          />
          <FieldError id="job-title-error" message={errors?.title} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-company">Company{!inPipeline && " (optional)"}</Label>
          <Input
            id="job-company"
            name="company"
            defaultValue={values.company}
            aria-invalid={Boolean(errors?.company)}
            aria-describedby="job-company-error"
          />
          <FieldError id="job-company-error" message={errors?.company} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-url">Job link</Label>
          <Input
            id="job-url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            defaultValue={values.url}
            aria-invalid={Boolean(errors?.url)}
            aria-describedby="job-url-error"
          />
          <FieldError id="job-url-error" message={errors?.url} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-platform">Platform</Label>
          <NativeSelect
            id="job-platform"
            name="platform"
            defaultValue={values.platform}
            className="w-full"
            aria-invalid={Boolean(errors?.platform)}
            aria-describedby="job-platform-error"
          >
            {JOB_PLATFORMS.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {PLATFORM_LABELS[value]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError id="job-platform-error" message={errors?.platform} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="job-notes">Notes</Label>
        <Textarea
          id="job-notes"
          name="notes"
          rows={6}
          maxLength={5000}
          placeholder="Recruiter name, interview prep, salary discussion…"
          defaultValue={values.notes}
          aria-invalid={Boolean(errors?.notes)}
          aria-describedby="job-notes-error"
        />
        <FieldError id="job-notes-error" message={errors?.notes} />
      </div>

      <Button type="submit" disabled={isPending} className="sm:self-start">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
