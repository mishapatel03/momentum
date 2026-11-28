import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { DeleteJobDialog } from "@/features/jobs/components/delete-job-dialog";
import { JobDetailsForm } from "@/features/jobs/components/job-details-form";
import { JobStatusControl } from "@/features/jobs/components/job-status-control";
import { JobTimeline } from "@/features/jobs/components/job-timeline";
import { PLATFORM_LABELS } from "@/features/jobs/labels";
import { getJob } from "@/features/jobs/queries";
import { jobIdSchema } from "@/features/jobs/schema";

export const metadata: Metadata = {
  title: "Job · Momentum",
};

export default function JobPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <>
      <Link
        href="/jobs"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to jobs
      </Link>
      <Suspense fallback={<p className="text-muted-foreground">Loading job…</p>}>
        <JobLoader params={params} />
      </Suspense>
    </>
  );
}

async function JobLoader({ params }: { params: PageProps<"/jobs/[id]">["params"] }) {
  const { id } = await params;
  if (!jobIdSchema.safeParse(id).success) notFound();

  const job = await getJob(id);
  if (!job) notFound();

  const title = job.title ?? "Untitled job";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
      <div className="flex min-w-0 flex-col gap-6">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              {job.company && <span>{job.company}</span>}
              <Badge variant="secondary">{PLATFORM_LABELS[job.platform]}</Badge>
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm underline-offset-4 hover:text-foreground hover:underline"
                >
                  Open posting
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          </div>
          <JobStatusControl job={job} />
        </header>

        <section aria-labelledby="details-heading" className="flex flex-col gap-4">
          <h2 id="details-heading" className="text-lg font-semibold">
            Details & notes
          </h2>
          <JobDetailsForm job={job} />
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <section aria-labelledby="history-heading" className="flex flex-col gap-4">
          <h2 id="history-heading" className="text-lg font-semibold">
            History
          </h2>
          <JobTimeline entries={job.timeline} />
        </section>
        <div className="border-t pt-6">
          <DeleteJobDialog jobId={job.id} label={title} />
        </div>
      </aside>
    </div>
  );
}
