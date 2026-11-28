"use client";

import type { ReactNode } from "react";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { JobPlatform } from "@/domain/jobs";
import { detectPlatform, JOB_PLATFORMS } from "@/domain/jobs";
import { celebrate } from "@/lib/confetti";

import { addAppliedJob, markApplied } from "../actions";
import { PLATFORM_LABELS } from "../labels";
import type { AppliedFormState } from "../schema";

type InboxJobDetails = {
  id: string;
  title: string | null;
  company: string | null;
  platform: JobPlatform;
};

type AppliedJobDialogProps = {
  trigger: ReactNode;
  /** An inbox job to mark as applied. Without it, the dialog adds a new applied job. */
  job?: InboxJobDetails;
};

const initialState: AppliedFormState = { status: "idle" };

export function AppliedJobDialog({ trigger, job }: AppliedJobDialogProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{job ? "Mark as applied" : "Add applied job"}</DialogTitle>
          <DialogDescription>
            {job
              ? "Confirm the details. It moves to your pipeline as applied today."
              : "For a job you applied to without saving it first."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts with a fresh form state. */}
        {open && <AppliedJobForm job={job} onDone={close} />}
      </DialogContent>
    </Dialog>
  );
}

function AppliedJobForm({ job, onDone }: { job?: InboxJobDetails; onDone: () => void }) {
  const jobId = job?.id;
  const action = useMemo(() => (jobId ? markApplied.bind(null, jobId) : addAppliedJob), [jobId]);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [platform, setPlatform] = useState<string>(job?.platform ?? "other");

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      void celebrate("small");
      onDone();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state, onDone]);

  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {!job && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="applied-url">Job link (optional)</Label>
          <Input
            id="applied-url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            autoComplete="off"
            defaultValue={values?.url}
            onChange={(event) => {
              const detected = detectPlatform(event.target.value);
              if (detected !== "other") setPlatform(detected);
            }}
            aria-invalid={Boolean(errors?.url)}
            aria-describedby="applied-url-error"
          />
          <FieldError id="applied-url-error" message={errors?.url} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="applied-title">Job title</Label>
        <Input
          id="applied-title"
          name="title"
          placeholder="Frontend Engineer"
          defaultValue={values?.title ?? job?.title ?? ""}
          aria-invalid={Boolean(errors?.title)}
          aria-describedby="applied-title-error"
          autoFocus={!job?.title}
        />
        <FieldError id="applied-title-error" message={errors?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="applied-company">Company</Label>
        <Input
          id="applied-company"
          name="company"
          placeholder="Acme"
          defaultValue={values?.company ?? job?.company ?? ""}
          aria-invalid={Boolean(errors?.company)}
          aria-describedby="applied-company-error"
        />
        <FieldError id="applied-company-error" message={errors?.company} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="applied-platform">Platform</Label>
        <NativeSelect
          id="applied-platform"
          name="platform"
          value={platform}
          onChange={(event) => setPlatform(event.target.value)}
          className="w-full"
          aria-invalid={Boolean(errors?.platform)}
          aria-describedby="applied-platform-error"
        >
          {JOB_PLATFORMS.map((value) => (
            <NativeSelectOption key={value} value={value}>
              {PLATFORM_LABELS[value]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError id="applied-platform-error" message={errors?.platform} />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : job ? "Mark as applied" : "Add job"}
        </Button>
      </DialogFooter>
    </form>
  );
}
