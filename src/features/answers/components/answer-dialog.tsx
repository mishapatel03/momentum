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
import { Textarea } from "@/components/ui/textarea";

import { saveAnswer } from "../actions";
import type { Answer } from "../queries";
import type { AnswerFormState } from "../schema";
import { BODY_MAX, LABEL_MAX } from "../schema";

/** Add a new answer, or edit `answer` when given. */
export function AnswerDialog({ trigger, answer }: { trigger: ReactNode; answer?: Answer }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{answer ? "Edit answer" : "Add answer"}</DialogTitle>
          <DialogDescription>Write it once, copy it into any application.</DialogDescription>
        </DialogHeader>
        {open && <AnswerForm answer={answer} onDone={close} />}
      </DialogContent>
    </Dialog>
  );
}

const initialState: AnswerFormState = { status: "idle" };

function AnswerForm({ answer, onDone }: { answer?: Answer; onDone: () => void }) {
  const answerId = answer?.id ?? null;
  const action = useMemo(() => saveAnswer.bind(null, answerId), [answerId]);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [bodyLength, setBodyLength] = useState(answer?.body.length ?? 0);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onDone();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state, onDone]);

  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="answer-label">Question or title</Label>
        <Input
          id="answer-label"
          name="label"
          maxLength={LABEL_MAX}
          placeholder="Why this company?"
          defaultValue={state.values?.label ?? answer?.label}
          aria-invalid={Boolean(errors?.label)}
          aria-describedby="answer-label-error"
        />
        <FieldError id="answer-label-error" message={errors?.label} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="answer-body">Answer</Label>
        <Textarea
          id="answer-body"
          name="body"
          rows={8}
          maxLength={BODY_MAX}
          defaultValue={state.values?.body ?? answer?.body}
          onChange={(event) => setBodyLength(event.target.value.length)}
          aria-invalid={Boolean(errors?.body)}
          aria-describedby="answer-body-hint answer-body-error"
        />
        <p id="answer-body-hint" className="text-right text-xs text-muted-foreground tabular-nums">
          {bodyLength.toLocaleString("en-US")} / {BODY_MAX.toLocaleString("en-US")}
        </p>
        <FieldError id="answer-body-error" message={errors?.body} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
