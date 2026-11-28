import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AnswerDialog } from "@/features/answers/components/answer-dialog";
import { AnswerList } from "@/features/answers/components/answer-list";
import { getAnswers } from "@/features/answers/queries";
import { ResumeCard } from "@/features/resume/components/resume-card";
import { getResume } from "@/features/resume/queries";

export const metadata: Metadata = {
  title: "Toolkit · Momentum",
};

export default function ToolkitPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader title="Toolkit" description="Answers and resume, one tap away." />

      <section aria-labelledby="answers-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="answers-heading" className="text-lg font-semibold">
            Quick answers
          </h2>
          <AnswerDialog
            trigger={
              <Button type="button" size="sm" variant="outline">
                <Plus aria-hidden />
                Add answer
              </Button>
            }
          />
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading answers…</p>}>
          <AnswersLoader />
        </Suspense>
      </section>

      <section aria-labelledby="resume-heading" className="flex flex-col gap-4">
        <h2 id="resume-heading" className="text-lg font-semibold">
          Resume
        </h2>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading resume…</p>}>
          <ResumeLoader />
        </Suspense>
      </section>
    </div>
  );
}

async function AnswersLoader() {
  const answers = await getAnswers();
  return <AnswerList answers={answers} />;
}

async function ResumeLoader() {
  const resume = await getResume();
  return <ResumeCard resume={resume} />;
}
