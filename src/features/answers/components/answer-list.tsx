"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  MessageSquareText,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { addStarterAnswers, deleteAnswer, moveAnswer } from "../actions";
import type { Answer } from "../queries";
import { AnswerDialog } from "./answer-dialog";

export function AnswerList({ answers }: { answers: Answer[] }) {
  if (answers.length === 0) return <EmptyAnswers />;

  return (
    <ul className="flex flex-col gap-3">
      {answers.map((answer, index) => (
        <AnswerCard
          key={answer.id}
          answer={answer}
          isFirst={index === 0}
          isLast={index === answers.length - 1}
        />
      ))}
    </ul>
  );
}

function AnswerCard({
  answer,
  isFirst,
  isLast,
}: {
  answer: Answer;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isLong = answer.body.length > 240 || answer.body.split("\n").length > 4;

  async function copy() {
    try {
      await navigator.clipboard.writeText(answer.body);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) toast.error(result.message ?? "Something went wrong.");
    });
  }

  return (
    <li className={cn("flex flex-col gap-3 rounded-xl border p-4", isPending && "opacity-60")}>
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 font-semibold break-words">{answer.label}</h3>
        <Button type="button" size="sm" onClick={copy} aria-label={`Copy answer: ${answer.label}`}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <p
        className={cn(
          "text-sm break-words whitespace-pre-line text-muted-foreground",
          !expanded && "line-clamp-4",
        )}
      >
        {answer.body}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        {isLong && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : "Show all"}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst || isPending}
            onClick={() => run(() => moveAnswer(answer.id, "up"))}
            aria-label={`Move ${answer.label} up`}
          >
            <ArrowUp aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast || isPending}
            onClick={() => run(() => moveAnswer(answer.id, "down"))}
            aria-label={`Move ${answer.label} down`}
          >
            <ArrowDown aria-hidden />
          </Button>
          <AnswerDialog
            answer={answer}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${answer.label}`}
              >
                <Pencil aria-hidden />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${answer.label}`}
              >
                <Trash2 aria-hidden />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{answer.label}”?</AlertDialogTitle>
                <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => run(() => deleteAnswer(answer.id))}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </li>
  );
}

function EmptyAnswers() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      <MessageSquareText className="size-6" aria-hidden />
      <p>Save answers to the questions every application asks, then copy them in one tap.</p>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await addStarterAnswers();
            if (result.ok) toast.success("Starter answers added. Edit the [brackets]!");
            else toast.error(result.message);
          })
        }
      >
        <Sparkles aria-hidden />
        {isPending ? "Adding…" : "Add starter set"}
      </Button>
    </div>
  );
}
