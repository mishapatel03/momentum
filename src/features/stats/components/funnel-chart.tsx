import type { FunnelStage } from "@/domain/stats";

/**
 * Horizontal bars, one hue (a single series needs no legend). Each row's text carries the
 * numbers, so the bars are decoration for sighted users and hidden from screen readers.
 */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((stage) => stage.count));

  return (
    <ol className="flex flex-col gap-3">
      {stages.map((stage) => (
        <li key={stage.key} className="grid grid-cols-[7rem_1fr] items-center gap-3 text-sm">
          <span className="text-muted-foreground">{stage.label}</span>
          <div className="flex items-center gap-2">
            <div className="h-5 min-w-0 flex-1" aria-hidden>
              {stage.count > 0 && (
                <div
                  className="h-full rounded-r-[4px] bg-viz-series"
                  style={{ width: `${(stage.count / max) * 100}%` }}
                />
              )}
            </div>
            <span className="w-24 shrink-0 text-right tabular-nums">
              <span className="font-semibold">{stage.count}</span>
              {stage.conversion !== null && (
                <span className="text-muted-foreground"> · {stage.conversion}%</span>
              )}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
