"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { saveSettings } from "../actions";
import type { SettingsFormState } from "../schema";
import { DAILY_TARGET } from "../schema";

type SettingsFormProps = {
  /** Null on first visit: the browser's timezone is picked after mount. */
  timezone: string | null;
  challengeStartDate: string;
  dailyApplyTarget: number;
  today: string;
  timezones: readonly string[];
};

const initialState: SettingsFormState = { status: "idle" };

export function SettingsForm({
  timezone,
  challengeStartDate,
  dailyApplyTarget,
  today,
  timezones,
}: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(saveSettings, initialState);
  const timezoneRef = useRef<HTMLSelectElement>(null);

  // First visit: default to the browser's timezone. Done after mount to avoid a hydration mismatch.
  useEffect(() => {
    if (timezone || !timezoneRef.current) return;
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezones.includes(browserTimezone)) timezoneRef.current.value = browserTimezone;
  }, [timezone, timezones]);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="timezone">Timezone</Label>
        <NativeSelect
          ref={timezoneRef}
          id="timezone"
          name="timezone"
          defaultValue={state.values?.timezone ?? timezone ?? "UTC"}
          className="w-full"
          aria-invalid={Boolean(errors?.timezone)}
          aria-describedby="timezone-hint timezone-error"
        >
          {timezones.map((tz) => (
            <NativeSelectOption key={tz} value={tz}>
              {tz.replaceAll("_", " ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <p id="timezone-hint" className="text-sm text-muted-foreground">
          Decides when your day starts and ends.
        </p>
        <FieldError id="timezone-error" message={errors?.timezone} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="challengeStartDate">Challenge start date</Label>
        <Input
          id="challengeStartDate"
          name="challengeStartDate"
          type="date"
          max={today}
          defaultValue={state.values?.challengeStartDate ?? challengeStartDate}
          aria-invalid={Boolean(errors?.challengeStartDate)}
          aria-describedby="challengeStartDate-error"
        />
        <FieldError id="challengeStartDate-error" message={errors?.challengeStartDate} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="dailyApplyTarget">Daily apply target</Label>
        <Input
          id="dailyApplyTarget"
          name="dailyApplyTarget"
          type="number"
          inputMode="numeric"
          min={DAILY_TARGET.min}
          max={DAILY_TARGET.max}
          step={1}
          defaultValue={state.values?.dailyApplyTarget ?? dailyApplyTarget}
          aria-invalid={Boolean(errors?.dailyApplyTarget)}
          aria-describedby="dailyApplyTarget-hint dailyApplyTarget-error"
        />
        <p id="dailyApplyTarget-hint" className="text-sm text-muted-foreground">
          Changes apply from today. Past days keep their old target.
        </p>
        <FieldError id="dailyApplyTarget-error" message={errors?.dailyApplyTarget} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto sm:self-start">
        {isPending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
