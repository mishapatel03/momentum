import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Stats · Momentum",
};

export default function StatsPage() {
  return (
    <>
      <PageHeader title="Stats" description="How your search is going." />
      <ComingSoon icon={BarChart3} text="Funnel and platform stats are coming soon." />
    </>
  );
}
