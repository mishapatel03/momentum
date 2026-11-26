"use client";

import { X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteSavedSearch } from "../actions";

export function DeleteSavedSearchButton({ id, label }: { id: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label={`Remove ${label}`}
      onClick={() =>
        startTransition(async () => {
          const { ok } = await deleteSavedSearch(id);
          if (!ok) toast.error("Couldn't remove the search. Please try again.");
        })
      }
    >
      <X aria-hidden />
    </Button>
  );
}
