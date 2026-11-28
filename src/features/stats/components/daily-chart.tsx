import type { DailyApplications } from "@/domain/stats";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = 160;

/**
 * Applications per day (columns) against the daily target (a step line).
 * Every column is focusable with a tooltip; the same numbers are in the table view.
 */
export function DailyChart({ days }: { days: DailyApplications[] }) {
  const max = niceMax(Math.max(1, ...days.flatMap((d) => [d.count, d.target ?? 0])));
  const pct = (value: number) => `${(value / max) * 100}%`;
  const labelEvery = 7;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[2px] bg-viz-series" aria-hidden />
          Applications
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-foreground/60" aria-hidden />
          Daily target
        </span>
      </figcaption>

      <div className="flex gap-2">
        {/* Y axis: top, middle and zero, each centred on its gridline. */}
        <div
          className="relative w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums"
          style={{ height: CHART_HEIGHT }}
          aria-hidden
        >
          {[max, max / 2, 0].map((value, i) => (
            <span
              key={value}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${i * 50}%` }}
            >
              {value}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            <div className="absolute inset-x-0 top-0 border-t border-viz-grid" aria-hidden />
            <div className="absolute inset-x-0 top-1/2 border-t border-viz-grid" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 border-t border-viz-axis" aria-hidden />

            <ol className="absolute inset-0 flex" aria-label="Applications per day, last 30 days">
              {days.map((day, index) => {
                const align =
                  index < days.length / 3
                    ? "left"
                    : index > (days.length * 2) / 3
                      ? "right"
                      : "center";
                const description = `${formatDay(day.day, "short")}: ${day.count} ${day.count === 1 ? "application" : "applications"}${day.target ? `, target ${day.target}` : ""}`;
                return (
                  <li
                    key={day.day}
                    tabIndex={0}
                    aria-label={description}
                    className="group relative flex h-full flex-1 justify-center outline-none"
                  >
                    {/* Hover/focus wash makes the hit target the whole column, not the bar. */}
                    <span
                      className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60"
                      aria-hidden
                    />
                    {day.count > 0 && (
                      <span
                        className="absolute bottom-0 w-[60%] max-w-6 rounded-t-[4px] bg-viz-series"
                        style={{ height: pct(day.count) }}
                        aria-hidden
                      />
                    )}
                    {day.target !== null && (
                      <span
                        className="absolute inset-x-0 h-0.5 bg-foreground/60"
                        style={{ bottom: `calc(${pct(day.target)} - 1px)` }}
                        aria-hidden
                      />
                    )}
                    <span
                      role="tooltip"
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover:block group-focus-visible:block",
                        align === "left" && "left-0",
                        align === "right" && "right-0",
                        align === "center" && "left-1/2 -translate-x-1/2",
                      )}
                    >
                      <strong className="font-semibold tabular-nums">{day.count}</strong> applied
                      {day.target !== null && (
                        <span className="text-muted-foreground"> / target {day.target}</span>
                      )}
                      <br />
                      <span className="text-muted-foreground">{formatDay(day.day, "short")}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative mt-1 h-4 text-xs text-muted-foreground" aria-hidden>
            {days.map((day, index) =>
              isLabelled(index, days.length, labelEvery) ? (
                <span
                  key={day.day}
                  className={cn(
                    "absolute",
                    index === days.length - 1 ? "right-0" : "-translate-x-1/2",
                  )}
                  style={
                    index === days.length - 1
                      ? undefined
                      : { left: `${((index + 0.5) / days.length) * 100}%` }
                  }
                >
                  {index === days.length - 1 ? "Today" : formatDay(day.day, "short")}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <details className="text-sm">
        <summary className="w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Show as table
        </summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted/60">
              <tr>
                <th scope="col" className="px-3 py-1.5 font-medium">
                  Day
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-medium">
                  Applied
                </th>
                <th scope="col" className="px-3 py-1.5 text-right font-medium">
                  Target
                </th>
              </tr>
            </thead>
            <tbody className="divide-y tabular-nums">
              {[...days].reverse().map((day) => (
                <tr key={day.day}>
                  <th scope="row" className="px-3 py-1.5 font-normal">
                    {formatDay(day.day, "short")}
                  </th>
                  <td className="px-3 py-1.5 text-right">{day.count}</td>
                  <td className="px-3 py-1.5 text-right text-muted-foreground">
                    {day.target ?? "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

/** Every 7th day plus "Today", skipping a weekly label that would crowd "Today". */
function isLabelled(index: number, count: number, every: number): boolean {
  const last = count - 1;
  return index === last || (index % every === 0 && last - index >= 4);
}

/** Rounds the axis top up to an even number, so the half-way gridline lands on a whole number. */
function niceMax(value: number): number {
  const rounded = Math.ceil(value * 1.1);
  return rounded % 2 === 0 ? rounded : rounded + 1;
}
