import { Flame, PartyPopper, Target } from "lucide-react";
import type { ReactNode } from "react";

import { Progress } from "@/components/ui/progress";
import type { ChallengeProgress } from "@/domain/challenge";
import { RULES } from "@/domain/rules";
import type { Streak } from "@/domain/streak";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProgressStatsProps = { streak: Streak; challenge: ChallengeProgress };

export function ProgressStats({ streak, challenge }: ProgressStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StreakTile streak={streak} />
      <ChallengeDayTile challenge={challenge} />
      <CelebrationTile challenge={challenge} />
    </div>
  );
}

function Tile({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section aria-label={label} className="flex flex-col gap-2 rounded-xl border p-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {label}
      </h2>
      {children}
    </section>
  );
}

function StreakTile({ streak }: { streak: Streak }) {
  const hint = streak.todayComplete
    ? "Today's done. See you tomorrow!"
    : streak.current > 0
      ? `Finish today to make it ${streak.current + 1}`
      : "Finish today to start a streak";

  return (
    <Tile
      label="Streak"
      icon={
        <Flame
          className={cn("size-4", streak.current > 0 && "fill-orange-500 text-orange-500")}
          aria-hidden
        />
      }
    >
      <p className="text-3xl font-semibold tabular-nums">
        {streak.current}
        <span className="text-base font-normal text-muted-foreground">
          {" "}
          {streak.current === 1 ? "day" : "days"}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">
        {hint} · Best {streak.best}
      </p>
    </Tile>
  );
}

function ChallengeDayTile({ challenge }: { challenge: ChallengeProgress }) {
  const { dayNumber } = challenge;
  const finished = dayNumber > RULES.challengeDays;

  return (
    <Tile label="Challenge" icon={<Target className="size-4" aria-hidden />}>
      <p className="text-3xl font-semibold tabular-nums">
        Day {dayNumber}
        <span className="text-base font-normal text-muted-foreground">
          {" "}
          of {RULES.challengeDays}
        </span>
      </p>
      <Progress
        value={Math.min(100, (dayNumber / RULES.challengeDays) * 100)}
        aria-label={`Day ${dayNumber} of ${RULES.challengeDays}`}
      />
      {finished && (
        <p className="text-xs text-muted-foreground">30 days done. Keep the momentum going!</p>
      )}
    </Tile>
  );
}

function CelebrationTile({ challenge }: { challenge: ChallengeProgress }) {
  const { current, daysLeft, windows } = challenge;
  const earned = windows.filter((w) => w.status === "passed").length;
  const score = current.settledPercent;
  const onTrack = score !== null && score >= RULES.passPercent;

  return (
    <Tile
      label={`Celebration #${current.number}`}
      icon={<PartyPopper className="size-4" aria-hidden />}
    >
      <p className="text-3xl font-semibold tabular-nums">
        {daysLeft}
        <span className="text-base font-normal text-muted-foreground">
          {" "}
          {daysLeft === 1 ? "day left" : "days left"}
        </span>
      </p>
      <div className="flex flex-col gap-1">
        <ScoreBar score={score} />
        <p className="text-xs text-muted-foreground">
          {score === null
            ? `Score starts counting tomorrow · goal ${RULES.passPercent}%`
            : `${score}% so far · ${onTrack ? "on track 🎯" : `goal ${RULES.passPercent}%`}`}
        </p>
      </div>
      {current.extensions > 0 && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Moved to {formatDay(current.end, "short")} (+{current.extensions * RULES.extensionDays}{" "}
          days) after missing {RULES.passPercent}%.
        </p>
      )}
      {earned > 0 && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          🎉 {earned} {earned === 1 ? "celebration" : "celebrations"} earned
        </p>
      )}
    </Tile>
  );
}

/** Progress bar with a marker at the pass mark. */
function ScoreBar({ score }: { score: number | null }) {
  return (
    <div className="relative">
      <Progress
        value={score ?? 0}
        aria-label={score === null ? "No score yet" : `Score ${score}%`}
        className={cn(score !== null && score >= RULES.passPercent && "[&>*]:bg-emerald-500")}
      />
      <span
        className="absolute -top-1 h-4 w-0.5 rounded bg-foreground/60"
        style={{ left: `${RULES.passPercent}%` }}
        aria-hidden
      />
    </div>
  );
}
