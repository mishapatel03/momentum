import { Sparkles } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { Level } from "@/domain/xp";

export function LevelBar({ level }: { level: Level }) {
  const toNext = level.next ? level.next.minXp - level.xp : 0;

  return (
    <section
      aria-label={`Level ${level.number}, ${level.name}, ${level.xp} XP`}
      className="flex flex-col gap-2 rounded-xl border bg-gradient-to-r from-violet-500/10 to-transparent p-4"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          <Sparkles className="size-3.5" aria-hidden />
          Lv {level.number}
        </span>
        <span className="font-semibold">{level.name}</span>
        <span className="ml-auto text-sm text-muted-foreground tabular-nums">
          {level.xp.toLocaleString("en-US")} XP
        </span>
      </div>
      <Progress
        value={level.progress}
        aria-label={`${level.progress}% of the way to the next level`}
        className="[&>*]:bg-violet-600"
      />
      <p className="text-xs text-muted-foreground">
        {level.next
          ? `${toNext.toLocaleString("en-US")} XP to ${level.next.name}`
          : "Top level reached. You're an Offer Magnet! 🧲"}
      </p>
    </section>
  );
}
