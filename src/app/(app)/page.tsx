import { CalendarCheck } from "lucide-react";
import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Today · Momentum",
};

export default function TodayPage() {
  return (
    <>
      <PageHeader title="Today" description="Your missions for the day." />
      <ComingSoon icon={CalendarCheck} text="Daily missions are coming soon." />
    </>
  );
}
