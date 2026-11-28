import type { PipelineStatus } from "@/domain/pipeline";
import type { TimelineEntry } from "@/domain/timeline";
import { cn } from "@/lib/utils";

import { STATUS_DOT, STATUS_LABELS } from "../labels";
import type { JobDetails } from "../queries";

export function JobTimeline({ entries }: { entries: JobDetails["timeline"] }) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={`${entry.at}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
          {/* Connecting line between dots */}
          {index < entries.length - 1 && (
            <span className="absolute top-3 left-[5px] h-full w-px bg-border" aria-hidden />
          )}
          <span
            className={cn(
              "relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-background",
              dotFor(entry),
            )}
            aria-hidden
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{describe(entry)}</span>
            <time dateTime={entry.at} className="text-xs text-muted-foreground">
              {entry.when}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

function describe(entry: TimelineEntry): string {
  switch (entry.kind) {
    case "saved":
      return "Saved to inbox";
    case "added_applied":
      return "Added as applied";
    case "applied":
      return "Applied";
    case "follow_up":
      return "Followed up";
    case "moved":
      return `Moved to ${entry.status ? STATUS_LABELS[entry.status as PipelineStatus] : "?"}`;
  }
}

function dotFor(entry: TimelineEntry): string {
  if (entry.kind === "moved" && entry.status) return STATUS_DOT[entry.status as PipelineStatus];
  if (entry.kind === "saved") return "bg-muted-foreground";
  return STATUS_DOT.applied;
}
