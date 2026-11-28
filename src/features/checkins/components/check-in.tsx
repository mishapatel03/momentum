"use client";

import { Pencil } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { saveCheckIn } from "../actions";
import type { CheckInState, Mood } from "../schema";
import { MOOD_EMOJI, MOODS, NOTE_MAX } from "../schema";

type CheckInProps = { checkIn: { mood: Mood; note: string | null } | null };

/** Shows today's check-in, or the form when there isn't one yet (or while editing). */
export function CheckIn({ checkIn }: CheckInProps) {
  const [editing, setEditing] = useState(false);

  if (checkIn && !editing) {
    const { emoji, label } = MOOD_EMOJI[checkIn.mood];
    return (
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none" role="img" aria-label={label}>
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{label} day</p>
          {checkIn.note && (
            <p className="text-sm break-words text-muted-foreground">{checkIn.note}</p>
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil aria-hidden />
          Edit
        </Button>
      </div>
    );
  }

  return <CheckInForm initial={checkIn} onSaved={() => setEditing(false)} />;
}

const initialState: CheckInState = { status: "idle" };

function CheckInForm({
  initial,
  onSaved,
}: {
  initial: CheckInProps["checkIn"];
  onSaved: () => void;
}) {
  const [state, formAction, isPending] = useActionState(saveCheckIn, initialState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      onSaved();
    }
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state, onSaved]);

  const mood = state.values?.mood ?? initial?.mood;
  const note = state.values?.note ?? initial?.note ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">How did today go?</legend>
        <div className="grid max-w-sm grid-cols-5 gap-2">
          {MOODS.map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="mood"
                value={value}
                defaultChecked={mood === value}
                className="peer sr-only"
                aria-describedby="mood-error"
              />
              <span
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs transition-colors",
                  "peer-checked:border-primary peer-checked:bg-accent peer-checked:ring-2 peer-checked:ring-primary/30 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                  "hover:bg-accent/60",
                )}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {MOOD_EMOJI[value].emoji}
                </span>
                {MOOD_EMOJI[value].label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="mood-error" message={state.fieldErrors?.mood} />
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="checkin-note" className="sr-only">
          Note
        </label>
        <Input
          id="checkin-note"
          name="note"
          maxLength={NOTE_MAX}
          placeholder="One line about today (optional)"
          defaultValue={note}
          aria-invalid={Boolean(state.fieldErrors?.note)}
          aria-describedby="checkin-note-error"
        />
        <FieldError id="checkin-note-error" message={state.fieldErrors?.note} />
      </div>

      <Button type="submit" disabled={isPending} className="sm:self-start">
        {isPending ? "Saving…" : initial ? "Update check-in" : "Check in"}
      </Button>
    </form>
  );
}
