import { Briefcase } from "lucide-react";
import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Jobs · Momentum",
};

export default function JobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Your job inbox and pipeline." />
      <ComingSoon icon={Briefcase} text="The pipeline board is coming soon." />
    </>
  );
}
