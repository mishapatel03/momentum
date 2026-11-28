"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Briefcase } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import type { PipelineStatus } from "@/domain/pipeline";
import { canMove, isPipelineStatus, PIPELINE_STATUSES } from "@/domain/pipeline";
import { cn } from "@/lib/utils";

import { moveJob } from "../actions";
import { STATUS_DOT, STATUS_LABELS } from "../labels";
import type { PipelineJob } from "../queries";
import { JobCard } from "./job-card";

type Move = { id: string; to: PipelineStatus };

export function PipelineBoard({ jobs }: { jobs: PipelineJob[] }) {
  const [optimisticJobs, applyMove] = useOptimistic(jobs, (current: PipelineJob[], move: Move) =>
    current.map((job) => (job.id === move.id ? { ...job, status: move.to } : job)),
  );
  const [, startTransition] = useTransition();

  function move(job: PipelineJob, to: PipelineStatus) {
    if (!canMove(job.status, to)) return;
    startTransition(async () => {
      applyMove({ id: job.id, to }); // instant; reverts automatically if the save fails
      const result = await moveJob(job.id, to);
      if (result.ok) toast.success(`Moved to ${STATUS_LABELS[to]}`);
      else toast.error(result.message);
    });
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        <Briefcase className="size-6" aria-hidden />
        <p>No applications yet. Mark an inbox job as applied to start your pipeline.</p>
      </div>
    );
  }

  const byStatus = groupByStatus(optimisticJobs);

  return (
    <>
      <div className="md:hidden">
        <StatusTabs byStatus={byStatus} onMove={move} />
      </div>
      <div className="hidden md:block">
        <Columns byStatus={byStatus} jobs={optimisticJobs} onMove={move} />
      </div>
    </>
  );
}

type GroupedJobs = Record<PipelineStatus, PipelineJob[]>;
type MoveHandler = (job: PipelineJob, to: PipelineStatus) => void;

function groupByStatus(jobs: PipelineJob[]): GroupedJobs {
  const grouped = Object.fromEntries(
    PIPELINE_STATUSES.map((s) => [s, []]),
  ) as unknown as GroupedJobs;
  for (const job of jobs) grouped[job.status].push(job);
  return grouped;
}

// ─── Mobile: tabs + "Move to" menu ─────────────────────────────────────────

function StatusTabs({ byStatus, onMove }: { byStatus: GroupedJobs; onMove: MoveHandler }) {
  const [selected, setSelected] = useState<PipelineStatus>("applied");
  const jobs = byStatus[selected];

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Pipeline status"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1"
      >
        {PIPELINE_STATUSES.map((status) => {
          const active = status === selected;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="pipeline-tabpanel"
              onClick={() => setSelected(status)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("size-2 rounded-full", STATUS_DOT[status])} aria-hidden />
              {STATUS_LABELS[status]}
              <span className="tabular-nums opacity-70">{byStatus[status].length}</span>
            </button>
          );
        })}
      </div>

      <div id="pipeline-tabpanel" role="tabpanel" className="flex flex-col gap-2">
        {jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing in {STATUS_LABELS[selected]} yet.
          </p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} onMove={(to) => onMove(job, to)} />)
        )}
      </div>
    </div>
  );
}

// ─── Desktop: drag-and-drop columns ─────────────────────────────────────────

function Columns({
  byStatus,
  jobs,
  onMove,
}: {
  byStatus: GroupedJobs;
  jobs: PipelineJob[];
  onMove: MoveHandler;
}) {
  const sensors = useSensors(
    // A small distance lets clicks on links and menus work without starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeJob = jobs.find((job) => job.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const job = jobs.find((j) => j.id === event.active.id);
    const to = event.over?.id;
    if (job && typeof to === "string" && isPipelineStatus(to)) onMove(job, to);
  }

  return (
    // A stable id keeps dnd-kit's generated aria ids identical on server and client.
    <DndContext
      id="pipeline-board"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="-mx-6 overflow-x-auto px-6 pb-2">
        <div className="flex min-w-max gap-3">
          {PIPELINE_STATUSES.map((status) => (
            <Column key={status} status={status} jobs={byStatus[status]} onMove={onMove} />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeJob && <JobCard job={activeJob} className="w-52 rotate-2 shadow-lg" />}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  jobs,
  onMove,
}: {
  status: PipelineStatus;
  jobs: PipelineJob[];
  onMove: MoveHandler;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      aria-label={`${STATUS_LABELS[status]}, ${jobs.length} jobs`}
      className={cn(
        "flex w-56 shrink-0 flex-col gap-2 rounded-xl border bg-muted/40 p-2 transition-colors",
        isOver && "border-primary/40 bg-accent",
      )}
    >
      <h3 className="flex items-center gap-2 px-1 py-1 text-sm font-semibold">
        <span className={cn("size-2 rounded-full", STATUS_DOT[status])} aria-hidden />
        {STATUS_LABELS[status]}
        <span className="ml-auto text-muted-foreground tabular-nums">{jobs.length}</span>
      </h3>
      <div className="flex min-h-24 flex-col gap-2">
        {jobs.map((job) => (
          <DraggableCard key={job.id} job={job} onMove={onMove} />
        ))}
        {jobs.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Drop here
          </p>
        )}
      </div>
    </section>
  );
}

function DraggableCard({ job, onMove }: { job: PipelineJob; onMove: MoveHandler }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });

  return (
    <JobCard
      ref={setNodeRef}
      job={job}
      onMove={(to) => onMove(job, to)}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
      aria-label={`${job.title} at ${job.company}. Press space to pick up and drag.`}
    />
  );
}
