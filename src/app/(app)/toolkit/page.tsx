import { Wrench } from "lucide-react";
import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Toolkit · Momentum",
};

export default function ToolkitPage() {
  return (
    <>
      <PageHeader title="Toolkit" description="Answers and resume, one tap away." />
      <ComingSoon icon={Wrench} text="Quick-copy answers are coming soon." />
    </>
  );
}
