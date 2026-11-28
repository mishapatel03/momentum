import type { Stats } from "../queries";

export function StatTiles({ stats }: { stats: Stats }) {
  const tiles = [
    { label: "Applied", value: String(stats.applied), note: "all time" },
    {
      label: "Reply rate",
      value: stats.replyRate === null ? "–" : `${stats.replyRate}%`,
      note: "any answer, incl. rejections",
    },
    { label: "Interviews", value: String(stats.interviews), note: "jobs that reached one" },
    { label: "Offers", value: String(stats.offers), note: stats.offers > 0 ? "🎉" : "coming soon" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1 rounded-xl border p-4">
          <dt className="text-sm text-muted-foreground">{tile.label}</dt>
          <dd className="text-3xl font-semibold">{tile.value}</dd>
          <dd className="text-xs text-muted-foreground">{tile.note}</dd>
        </div>
      ))}
    </dl>
  );
}
