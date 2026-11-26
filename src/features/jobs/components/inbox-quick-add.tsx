"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addToInbox } from "../actions";
import type { AddToInboxState } from "../schema";

const initialState: AddToInboxState = { status: "idle" };

export function InboxQuickAdd() {
  const [state, formAction, isPending] = useActionState(addToInbox, initialState);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      urlRef.current?.focus(); // ready for the next link
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Job link</Label>
        <div className="flex gap-2">
          <Input
            ref={urlRef}
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            autoComplete="off"
            defaultValue={state.values?.url}
            aria-invalid={Boolean(errors?.url)}
            aria-describedby="url-error"
          />
          <Button type="submit" disabled={isPending} className="shrink-0">
            <Plus aria-hidden />
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
        <FieldError id="url-error" message={errors?.url} />
      </div>

      <details className="group" open={Boolean(errors?.title || errors?.company) || undefined}>
        <summary className="w-fit cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          Add title and company (optional)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Frontend Engineer"
              defaultValue={state.values?.title}
              aria-invalid={Boolean(errors?.title)}
              aria-describedby="title-error"
            />
            <FieldError id="title-error" message={errors?.title} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Acme"
              defaultValue={state.values?.company}
              aria-invalid={Boolean(errors?.company)}
              aria-describedby="company-error"
            />
            <FieldError id="company-error" message={errors?.company} />
          </div>
        </div>
      </details>
    </form>
  );
}
