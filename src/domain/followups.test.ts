import { describe, expect, it } from "vitest";

import type { LocalDay } from "./day";
import type { TrackedJob } from "./followups";
import {
  followUpsFor,
  isDoneOnTime,
  isOutstanding,
  outstandingFollowUps,
  shouldSuggestGhosted,
} from "./followups";

const d = (value: string) => value as LocalDay;

function job(overrides: Partial<TrackedJob> = {}): TrackedJob {
  return {
    id: "job-1",
    appliedOn: d("2026-11-01"),
    leftAppliedOn: null,
    followUpsSentOn: [],
    ...overrides,
  };
}

describe("followUpsFor", () => {
  it("schedules reminders 7 and 14 days after applying", () => {
    expect(followUpsFor(job()).map((f) => [f.number, f.dueOn])).toEqual([
      [1, "2026-11-08"],
      [2, "2026-11-15"],
    ]);
  });

  it("matches the nth follow-up sent to the nth reminder, even if sent early", () => {
    const [first, second] = followUpsFor(
      job({ followUpsSentOn: [d("2026-11-16"), d("2026-11-06")] }),
    );
    expect(first?.doneOn).toBe("2026-11-06");
    expect(second?.doneOn).toBe("2026-11-16");
  });

  it("skips reminders when the reply came on or before the due day", () => {
    expect(followUpsFor(job({ leftAppliedOn: d("2026-11-08") }))).toEqual([]);
    expect(followUpsFor(job({ leftAppliedOn: d("2026-11-10") })).map((f) => f.number)).toEqual([1]);
  });

  it("cancels an overdue reminder once a reply arrives", () => {
    const [first] = followUpsFor(job({ leftAppliedOn: d("2026-11-10") }));
    expect(first?.cancelledOn).toBe("2026-11-10");
  });

  it("doesn't cancel a reminder that was already done", () => {
    const [first] = followUpsFor(
      job({ leftAppliedOn: d("2026-11-10"), followUpsSentOn: [d("2026-11-08")] }),
    );
    expect(first?.cancelledOn).toBeNull();
  });
});

describe("isOutstanding", () => {
  const [first] = followUpsFor(job());

  it("isn't outstanding before its due day", () => {
    expect(isOutstanding(first!, d("2026-11-07"))).toBe(false);
  });

  it("stays outstanding every day after it's due until done", () => {
    expect(isOutstanding(first!, d("2026-11-08"))).toBe(true);
    expect(isOutstanding(first!, d("2026-11-20"))).toBe(true);
  });

  it("clears on the day it's done or cancelled", () => {
    const [done] = followUpsFor(job({ followUpsSentOn: [d("2026-11-09")] }));
    expect(isOutstanding(done!, d("2026-11-08"))).toBe(true);
    expect(isOutstanding(done!, d("2026-11-09"))).toBe(false);

    const [cancelled] = followUpsFor(job({ leftAppliedOn: d("2026-11-09") }));
    expect(isOutstanding(cancelled!, d("2026-11-09"))).toBe(false);
  });
});

describe("isDoneOnTime", () => {
  it("counts early and same-day follow-ups, not late ones", () => {
    const early = followUpsFor(job({ followUpsSentOn: [d("2026-11-05")] }))[0]!;
    const onTime = followUpsFor(job({ followUpsSentOn: [d("2026-11-08")] }))[0]!;
    const late = followUpsFor(job({ followUpsSentOn: [d("2026-11-09")] }))[0]!;
    expect([isDoneOnTime(early), isDoneOnTime(onTime), isDoneOnTime(late)]).toEqual([
      true,
      true,
      false,
    ]);
  });
});

describe("shouldSuggestGhosted", () => {
  it("suggests ghosted after 21 days with no reply", () => {
    expect(shouldSuggestGhosted(job(), d("2026-11-21"))).toBe(false);
    expect(shouldSuggestGhosted(job(), d("2026-11-22"))).toBe(true);
  });

  it("never suggests it once the job got a reply", () => {
    expect(shouldSuggestGhosted(job({ leftAppliedOn: d("2026-11-05") }), d("2026-12-30"))).toBe(
      false,
    );
  });
});

describe("outstandingFollowUps", () => {
  it("lists what's waiting across jobs, most overdue first", () => {
    const jobs = [
      job({ id: "recent", appliedOn: d("2026-11-05") }), // #1 due Nov 12
      job({ id: "older", appliedOn: d("2026-11-01"), followUpsSentOn: [d("2026-11-08")] }), // #2 due Nov 15
      job({ id: "answered", appliedOn: d("2026-11-01"), leftAppliedOn: d("2026-11-03") }),
    ];
    expect(outstandingFollowUps(jobs, d("2026-11-15")).map((f) => [f.jobId, f.number])).toEqual([
      ["recent", 1],
      ["older", 2],
    ]);
  });
});
