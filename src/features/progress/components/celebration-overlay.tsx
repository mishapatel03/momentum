"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChallengeWindow } from "@/domain/challenge";
import { XP_REWARDS } from "@/domain/xp";
import { celebrate } from "@/lib/confetti";
import { formatDay } from "@/lib/format";

import { markCelebrationSeen } from "../actions";

/** The big one: shown once per passed window, across all devices. */
export function CelebrationOverlay({ window }: { window: ChallengeWindow }) {
  const [open, setOpen] = useState(true);
  const [, startTransition] = useTransition();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // Strict Mode mounts twice in dev
    fired.current = true;
    void celebrate("big");
  }, []);

  function close() {
    setOpen(false);
    startTransition(async () => {
      await markCelebrationSeen(window.start, window.number);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="text-center sm:max-w-md">
        <DialogHeader className="items-center">
          <div className="text-6xl" aria-hidden>
            🎉
          </div>
          <DialogTitle className="text-2xl">Celebration #{window.number} earned!</DialogTitle>
          <DialogDescription className="text-base">
            You hit <strong className="text-foreground">{window.percent}%</strong> from{" "}
            {formatDay(window.start, "short")} to {formatDay(window.end, "short")}
            {window.extensions > 0 ? " (after a little extra time)" : ""}. That&apos;s consistency.
            Go enjoy your treat!
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          +{XP_REWARDS.celebrations} XP
        </p>
        <DialogFooter className="sm:justify-center">
          <Button type="button" size="lg" onClick={close} autoFocus>
            Let&apos;s keep going 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
