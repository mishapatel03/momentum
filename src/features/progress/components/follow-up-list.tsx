"use client";

import { Check, ExternalLink, Ghost, MessageSquareReply } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { logFollowUp, moveJob } from "@/features/jobs/actions";
import { cn } from "@/lib/utils";

import type { FollowUpItem, GhostSuggestion } from "../queries";

type FollowUpListProps = {
  followUps: FollowUpItem[];
  ghostSuggestions: GhostSuggestion[];
};

type Action = "followed-up" | "replied" | "ghosted";

const SUCCESS: Record<Action, string> = {
  "followed-up": "Follow-up logged 👍",
  replied: "Nice, moved to Response 🎉",
  ghosted: "Marked as ghosted",
};

export function FollowUpList({ followUps, ghostSuggestions }: FollowUpListProps) {
  // Rows disappear instantly; if the save fails they come back with an error toast.
  const [hidden, hide] = useOptimistic(new Set<string>(), (current, key: string) =>
    new Set(current).add(key),
  );
  const [, startTransition] = useTransition();

  function act(jobId: string, action: Action, rowKey: string) {
    startTransition(async () => {
      hide(rowKey);
      const result =
        action === "followed-up"
          ? await logFollowUp(jobId)
          : await moveJob(jobId, action === "replied" ? "response" : "ghosted");
      if (result.ok) toast.success(SUCCESS[action]);
      else toast.error(result.message);
    });
  }

  const visibleFollowUps = followUps.filter((f) => !hidden.has(followUpKey(f)));
  const visibleGhosts = ghostSuggestions.filter((g) => !hidden.has(ghostKey(g)));

  return (
    <div className="flex flex-col gap-4">
      {visibleFollowUps.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {visibleFollowUps.map((item) => (
            <li key={followUpKey(item)} className="flex flex-col gap-3 p-3">
              <JobLine item={item}>
                <span className={cn(item.daysOverdue > 0 && "text-amber-600 dark:text-amber-400")}>
                  {ordinal(item.number)} follow-up · {dueText(item.daysOverdue)}
                </span>
              </JobLine>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => act(item.jobId, "followed-up", followUpKey(item))}
                >
                  <Check aria-hidden />
                  Followed up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => act(item.jobId, "replied", followUpKey(item))}
                >
                  <MessageSquareReply aria-hidden />
                  Got a reply
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {visibleGhosts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">No reply in 3+ weeks</h3>
          <ul className="flex flex-col divide-y rounded-lg border border-dashed">
            {visibleGhosts.map((item) => (
              <li key={ghostKey(item)} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <JobLine item={item}>Applied {item.daysSinceApplied} days ago</JobLine>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => act(item.jobId, "ghosted", ghostKey(item))}
                >
                  <Ghost aria-hidden />
                  Mark ghosted
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JobLine({
  item,
  children,
}: {
  item: { jobId: string; title: string; company: string; url: string | null };
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="min-w-0 flex-1">
        <Link
          href={`/jobs/${item.jobId}`}
          className="block truncate font-medium underline-offset-4 hover:underline"
        >
          {item.title}
          {item.company && (
            <span className="font-normal text-muted-foreground"> · {item.company}</span>
          )}
        </Link>
        <p className="text-xs text-muted-foreground">{children}</p>
      </div>
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          aria-label={`Open ${item.title}`}
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
}

const followUpKey = (item: FollowUpItem) => `follow-up:${item.jobId}:${item.number}`;
const ghostKey = (item: GhostSuggestion) => `ghost:${item.jobId}`;

function ordinal(n: number): string {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

function dueText(daysOverdue: number): string {
  if (daysOverdue === 0) return "due today";
  return `${daysOverdue} ${daysOverdue === 1 ? "day" : "days"} overdue`;
}
