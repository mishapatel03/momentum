import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { InboxList } from "@/features/jobs/components/inbox-list";
import { InboxQuickAdd } from "@/features/jobs/components/inbox-quick-add";
import { getInboxJobs } from "@/features/jobs/queries";

export const metadata: Metadata = {
  title: "Jobs · Momentum",
};

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Save links now, apply later." />

      <section aria-labelledby="inbox-heading" className="flex flex-col gap-4">
        <h2 id="inbox-heading" className="text-lg font-semibold">
          Inbox
        </h2>
        <InboxQuickAdd />
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading inbox…</p>}>
          <InboxLoader />
        </Suspense>
      </section>

      <section aria-labelledby="pipeline-heading" className="flex flex-col gap-4">
        <h2 id="pipeline-heading" className="text-lg font-semibold">
          Pipeline
        </h2>
        <ComingSoon icon={Briefcase} text="The pipeline board is coming soon." />
      </section>
    </>
  );
}

async function InboxLoader() {
  const jobs = await getInboxJobs();
  return <InboxList jobs={jobs} />;
}
