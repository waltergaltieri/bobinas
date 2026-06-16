"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Barcode,
  Boxes,
  Building2,
  CarFront,
  CornerDownLeft,
  Search,
  Tags,
} from "lucide-react";

import type { CatalogSearchSuggestion } from "@/lib/data/catalog";
import { Input } from "@/components/ui/input";

type CatalogSearchBoxProps = {
  initialQuery?: string;
  suggestions: CatalogSearchSuggestion[];
};

const suggestionIcons = {
  product: Boxes,
  internal_code: Barcode,
  oem_code: Barcode,
  brand: Building2,
  model: CarFront,
  category: Tags,
  attribute: Tags,
} satisfies Record<CatalogSearchSuggestion["type"], typeof Search>;

export function CatalogSearchBox({
  initialQuery = "",
  suggestions,
}: CatalogSearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = normalizeSearch(query);
  const visibleSuggestions = useMemo(() => {
    if (normalizedQuery.text.length < 2) {
      return [];
    }

    return suggestions
      .filter((suggestion) => matchesSuggestion(suggestion, normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery, suggestions]);

  return (
    <div className="relative grid gap-2">
      <label className="text-sm font-medium" htmlFor="q">
        Buscar
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="q"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Codigo, OEM, marca, atributo..."
          className="h-11 pl-9 pr-10 font-mono text-sm"
        />
        <CornerDownLeft className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {visibleSuggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[76px] z-20 overflow-hidden rounded-md border bg-popover shadow-md">
          {visibleSuggestions.map((suggestion) => {
            const Icon = suggestionIcons[suggestion.type];

            return (
              <Link
                key={`${suggestion.type}-${suggestion.value}`}
                href={suggestionHref(suggestion)}
                className="grid grid-cols-[auto_1fr] gap-3 px-3 py-2 text-sm transition hover:bg-muted"
              >
                <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {suggestion.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {suggestion.helper}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function suggestionHref(suggestion: CatalogSearchSuggestion) {
  const params = new URLSearchParams(suggestion.params);
  return `/productos?${params.toString()}`;
}

function normalizeSearch(value: string) {
  const text = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  return {
    text: text.replace(/[^\p{Letter}\p{Number}]+/gu, " ").trim(),
    compact: text.replace(/[^\p{Letter}\p{Number}]+/gu, ""),
  };
}

function matchesSuggestion(
  suggestion: CatalogSearchSuggestion,
  query: ReturnType<typeof normalizeSearch>,
) {
  const label = normalizeSearch(suggestion.label);
  const helper = normalizeSearch(suggestion.helper);

  return (
    label.text.includes(query.text) ||
    label.compact.includes(query.compact) ||
    helper.text.includes(query.text) ||
    helper.compact.includes(query.compact)
  );
}
