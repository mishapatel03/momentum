import { ExternalLink, Search } from "lucide-react";

import { detectPlatform } from "@/domain/jobs";
import { PLATFORM_LABELS } from "@/features/jobs/labels";

import type { SavedSearch } from "../queries";
import { AddSavedSearchForm } from "./add-saved-search-form";
import { DeleteSavedSearchButton } from "./delete-saved-search-button";

export function SavedSearches({ searches }: { searches: SavedSearch[] }) {
  return (
    <div className="flex flex-col gap-3">
      {searches.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="size-4" aria-hidden />
          Save your go-to searches and open them in one tap.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {searches.map((search) => (
            <li key={search.id}>
              <a
                href={search.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                <span className="text-muted-foreground">
                  {PLATFORM_LABELS[detectPlatform(search.url)]}
                </span>
                <span className="truncate">{search.label}</span>
                <ExternalLink className="size-3.5 shrink-0" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}

      <details className="rounded-xl border p-3" open={searches.length === 0 || undefined}>
        <summary className="cursor-pointer text-sm font-medium">
          {searches.length === 0 ? "Add a search" : "Manage searches"}
        </summary>
        <div className="mt-3 flex flex-col gap-4">
          {searches.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {searches.map((search) => (
                <li key={search.id} className="flex items-center gap-2 py-1 pr-1 pl-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{search.label}</span>
                  <DeleteSavedSearchButton id={search.id} label={search.label} />
                </li>
              ))}
            </ul>
          )}
          <AddSavedSearchForm />
        </div>
      </details>
    </div>
  );
}
