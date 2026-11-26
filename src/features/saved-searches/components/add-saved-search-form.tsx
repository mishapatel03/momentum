"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { addSavedSearch } from "../actions";
import type { SavedSearchState } from "../schema";

const initialState: SavedSearchState = { status: "idle" };

export function AddSavedSearchForm() {
  const [state, formAction, isPending] = useActionState(addSavedSearch, initialState);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <p className="text-sm text-muted-foreground">
        Set up a search with your filters on any job site, then copy the link from the address bar.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="search-label">Name</Label>
          <Input
            id="search-label"
            name="label"
            placeholder="React · remote · 24h"
            defaultValue={state.values?.label}
            aria-invalid={Boolean(errors?.label)}
            aria-describedby="search-label-error"
          />
          <FieldError id="search-label-error" message={errors?.label} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="search-url">Search link</Label>
          <Input
            id="search-url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://www.linkedin.com/jobs/search/?keywords=…"
            autoComplete="off"
            defaultValue={state.values?.url}
            aria-invalid={Boolean(errors?.url)}
            aria-describedby="search-url-error"
          />
          <FieldError id="search-url-error" message={errors?.url} />
        </div>
      </div>
      <Button type="submit" variant="secondary" disabled={isPending} className="sm:self-start">
        {isPending ? "Saving…" : "Add search"}
      </Button>
    </form>
  );
}
