"use client";

import { ExternalLink } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import type { PipelineStatus } from "@/domain/pipeline";
import { cn } from "@/lib/utils";

import { PLATFORM_LABELS } from "../labels";
import type { PipelineJob } from "../queries";
import { MoveJobMenu } from "./move-job-menu";

/** Keeps clicks and key presses on inner controls from starting a card drag. */
const stopDrag = {
  onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
  onKeyDown: (event: { stopPropagation: () => void }) => event.stopPropagation(),
};

type JobCardProps = ComponentProps<"div"> & {
  job: PipelineJob;
  onMove?: (to: PipelineStatus) => void;
};

export function JobCard({ job, onMove, className, ...props }: JobCardProps) {
  const label = `${job.title} at ${job.company}`;

  return (
    <div
      className={cn("flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs", className)}
      {...props}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{job.title}</p>
          <p className="truncate text-sm text-muted-foreground">{job.company}</p>
        </div>
        {onMove && (
          <div {...stopDrag}>
            <MoveJobMenu current={job.status} label={label} onMove={onMove} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">{PLATFORM_LABELS[job.platform]}</Badge>
        <span>Applied {job.appliedOn}</span>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex size-6 items-center justify-center rounded hover:text-foreground"
            aria-label={`Open ${label}`}
          >
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}
