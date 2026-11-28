import { PLATFORM_LABELS } from "@/features/jobs/labels";

import type { PlatformRow } from "@/domain/stats";

export function PlatformTable({ rows }: { rows: PlatformRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">
              Platform
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Applied
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Replies
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Reply rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y tabular-nums">
          {rows.map((row) => (
            <tr key={row.platform}>
              <th scope="row" className="px-4 py-2 font-medium">
                {PLATFORM_LABELS[row.platform]}
              </th>
              <td className="px-4 py-2 text-right">{row.applied}</td>
              <td className="px-4 py-2 text-right">{row.replies}</td>
              <td className="px-4 py-2 text-right">
                {row.replyRate === null ? "–" : `${row.replyRate}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
