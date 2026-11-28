"use client";

import { Check } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PipelineStatus } from "@/domain/pipeline";
import { isPipelineStatus } from "@/domain/pipeline";
import { cn } from "@/lib/utils";

import { moveJob } from "../actions";
import { STATUS_DOT, STATUS_LABELS } from "../labels";
import type { JobDetails } from "../queries";
import { AppliedJobDialog } from "./applied-job-dialog";
import { MoveJobMenu } from "./move-job-menu";

/** Current status plus the right way to change it: "Applied" for inbox jobs, "Move to" otherwise. */
export function JobStatusControl({ job }: { job: JobDetails }) {
  const [isPending, startTransition] = useTransition();
  const label = job.title ?? "this job";

  if (!isPipelineStatus(job.status)) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">In your inbox</span>
        <AppliedJobDialog
          job={job}
          trigger={
            <Button type="button" size="sm">
              <Check aria-hidden />
              Mark as applied
            </Button>
          }
        />
      </div>
    );
  }

  const status = job.status;
  function handleMove(to: PipelineStatus) {
    startTransition(async () => {
      const result = await moveJob(job.id, to);
      if (result.ok) toast.success(`Moved to ${STATUS_LABELS[to]}`);
      else toast.error(result.message);
    });
  }

  return (
    <div className={cn("flex items-center gap-2", isPending && "opacity-60")}>
      <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
        <span className={cn("size-2 rounded-full", STATUS_DOT[status])} aria-hidden />
        {STATUS_LABELS[status]}
      </span>
      <MoveJobMenu current={status} label={label} onMove={handleMove} />
    </div>
  );
}
