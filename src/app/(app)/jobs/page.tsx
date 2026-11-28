import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AppliedJobDialog } from "@/features/jobs/components/applied-job-dialog";
import { InboxList } from "@/features/jobs/components/inbox-list";
import { InboxQuickAdd } from "@/features/jobs/components/inbox-quick-add";
import { PipelineBoard } from "@/features/jobs/components/pipeline-board";
import { getInboxJobs, getPipelineJobs } from "@/features/jobs/queries";
import { SavedSearches } from "@/features/saved-searches/components/saved-searches";
import { getSavedSearches } from "@/features/saved-searches/queries";

export const metadata: Metadata = {
  title: "Jobs · Momentum",
};

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Find jobs, save links, apply later." />

      <section aria-labelledby="find-heading" className="flex max-w-3xl flex-col gap-4">
        <h2 id="find-heading" className="text-lg font-semibold">
          Find jobs
        </h2>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading searches…</p>}>
          <SavedSearchesLoader />
        </Suspense>
      </section>

      <section aria-labelledby="inbox-heading" className="flex max-w-3xl flex-col gap-4">
        <h2 id="inbox-heading" className="text-lg font-semibold">
          Inbox
        </h2>
        <InboxQuickAdd />
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inbox…</p>}>
          <InboxLoader />
        </Suspense>
      </section>

      <section aria-labelledby="pipeline-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="pipeline-heading" className="text-lg font-semibold">
            Pipeline
          </h2>
          <AppliedJobDialog
            trigger={
              <Button type="button" size="sm" variant="outline">
                <Plus aria-hidden />
                Add applied job
              </Button>
            }
          />
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading pipeline…</p>}>
          <PipelineLoader />
        </Suspense>
      </section>
    </>
  );
}

async function SavedSearchesLoader() {
  const searches = await getSavedSearches();
  return <SavedSearches searches={searches} />;
}

async function InboxLoader() {
  const jobs = await getInboxJobs();
  return <InboxList jobs={jobs} />;
}

async function PipelineLoader() {
  const jobs = await getPipelineJobs();
  return <PipelineBoard jobs={jobs} />;
}
