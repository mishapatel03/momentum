import { CircleCheck, CircleDashed } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MissionCardProps = {
  title: string;
  done: boolean;
  /** Short status, e.g. "3 of 5". */
  summary: string;
  children?: ReactNode;
};

export function MissionCard({ title, done, summary, children }: MissionCardProps) {
  return (
    <section
      aria-label={`${title}: ${done ? "done" : "not done yet"}`}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
        done && "border-emerald-500/40 bg-emerald-500/5",
      )}
    >
      <header className="flex items-center gap-3">
        {done ? (
          <CircleCheck
            className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        ) : (
          <CircleDashed className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <h2 className="flex-1 font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground tabular-nums">{summary}</span>
      </header>
      {children}
    </section>
  );
}
