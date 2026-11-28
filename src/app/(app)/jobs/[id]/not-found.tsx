import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Job not found</h1>
      <p className="text-muted-foreground">It may have been deleted.</p>
      <Link href="/jobs" className="underline underline-offset-4">
        Back to jobs
      </Link>
    </div>
  );
}
