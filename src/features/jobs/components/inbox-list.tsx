import { Check, ExternalLink, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { PLATFORM_LABELS } from "../labels";
import type { InboxJob } from "../queries";
import { AppliedJobDialog } from "./applied-job-dialog";
import { DeleteJobButton } from "./delete-job-button";

export function InboxList({ jobs }: { jobs: InboxJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        <Inbox className="size-6" aria-hidden />
        <p>Your inbox is empty. Paste a job link above to save it for later.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-xl border">
      {jobs.map((job) => {
        const label = displayName(job);
        return (
          <li key={job.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate font-medium">{label}</p>
              <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{PLATFORM_LABELS[job.platform]}</Badge>
                {job.company && job.title && <span className="truncate">{job.company}</span>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-1">
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={`Open ${label}`}
                >
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              )}
              <AppliedJobDialog
                job={job}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    aria-label={`Mark ${label} as applied`}
                  >
                    <Check aria-hidden />
                    Applied
                  </Button>
                }
              />
              <DeleteJobButton jobId={job.id} label={label} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Title if known, otherwise the link's host and path, so every row is recognisable. */
function displayName(job: InboxJob): string {
  if (job.title) return job.title;
  if (!job.url) return "Untitled job";
  const url = new URL(job.url);
  return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}`;
}
