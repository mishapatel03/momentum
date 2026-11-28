import { ArrowRight, PartyPopper } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DayResult } from "@/domain/scoring";
import { CheckIn } from "@/features/checkins/components/check-in";
import type { Mood } from "@/features/checkins/schema";

import type { FollowUpItem, GhostSuggestion } from "../queries";
import { FollowUpList } from "./follow-up-list";
import { MissionCard } from "./mission-card";

type MissionsProps = {
  day: DayResult;
  checkIn: { mood: Mood; note: string | null } | null;
  followUps: FollowUpItem[];
  ghostSuggestions: GhostSuggestion[];
};

export function Missions({ day, checkIn, followUps, ghostSuggestions }: MissionsProps) {
  const applyDone = day.applied >= day.target;
  const followUpsDone = day.followUpsOutstanding === 0;

  return (
    <div className="flex flex-col gap-4">
      {day.complete && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 font-medium text-emerald-700 dark:text-emerald-300"
        >
          <PartyPopper className="size-5 shrink-0" aria-hidden />
          All missions done for today. Your streak is safe!
        </div>
      )}

      <MissionCard
        title={`Apply to ${day.target} ${day.target === 1 ? "job" : "jobs"}`}
        done={applyDone}
        summary={`${day.applied} of ${day.target}`}
      >
        <Progress
          value={Math.min(100, (day.applied / day.target) * 100)}
          aria-label={`${day.applied} of ${day.target} applications`}
        />
        {!applyDone && (
          <Button asChild variant="outline" size="sm" className="self-start">
            <Link href="/jobs">
              Go to Jobs
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        )}
      </MissionCard>

      <MissionCard
        title="Follow-ups"
        done={followUpsDone}
        summary={followUpsDone ? "All clear" : `${day.followUpsOutstanding} due`}
      >
        {followUpsDone && (
          <p className="text-sm text-muted-foreground">Nothing to follow up on today.</p>
        )}
        {!followUpsDone && (
          <p className="text-sm text-muted-foreground">
            A short, polite nudge to the recruiter works best. Tap <strong>Followed up</strong> once
            it&apos;s sent.
          </p>
        )}
        <FollowUpList followUps={followUps} ghostSuggestions={ghostSuggestions} />
      </MissionCard>

      <MissionCard
        title="Evening check-in"
        done={day.checkedIn}
        summary={day.checkedIn ? "Done" : "Not yet"}
      >
        <CheckIn checkIn={checkIn} />
      </MissionCard>
    </div>
  );
}
