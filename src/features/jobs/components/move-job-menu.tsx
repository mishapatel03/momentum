"use client";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PipelineStatus } from "@/domain/pipeline";
import { PIPELINE_STATUSES } from "@/domain/pipeline";
import { cn } from "@/lib/utils";

import { STATUS_DOT, STATUS_LABELS } from "../labels";

type MoveJobMenuProps = {
  current: PipelineStatus;
  label: string;
  onMove: (to: PipelineStatus) => void;
};

export function MoveJobMenu({ current, label, onMove }: MoveJobMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${label}`}>
          <ArrowRightLeft aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PIPELINE_STATUSES.filter((status) => status !== current).map((status) => (
          <DropdownMenuItem key={status} onSelect={() => onMove(status)}>
            <span className={cn("size-2 rounded-full", STATUS_DOT[status])} aria-hidden />
            {STATUS_LABELS[status]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
