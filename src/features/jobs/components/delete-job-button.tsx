"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteJob } from "../actions";

export function DeleteJobButton({ jobId, label }: { jobId: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await deleteJob(jobId);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Delete ${label}`}
    >
      <Trash2 aria-hidden />
    </Button>
  );
}
