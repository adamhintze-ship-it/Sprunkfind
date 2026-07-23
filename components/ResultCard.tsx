"use client";

import type { FinderResult } from "@/lib/types";

export default function ResultCard({
  result,
  onWant,
  wanted,
}: {
  result: FinderResult;
  onWant?: () => void;
  wanted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-sprunki-panel/70 p-4 ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">{result.title}</h3>
        <span className="shrink-0 rounded-full bg-sprunki-lime/20 px-3 py-1 text-sm font-bold text-sprunki-lime">
          {result.price}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {result.character && result.character !== "Unknown" && (
          <span className="rounded-full bg-sprunki-accent/20 px-2.5 py-1 text-sprunki-accent">
            {result.character}
          </span>
        )}
        {result.phase && result.phase !== "Unknown" && (
          <span className="rounded-full bg-sprunki-accent2/20 px-2.5 py-1 text-sprunki-accent2">
            {result.phase}
          </span>
        )}
        {result.domain && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">
            {result.domain}
          </span>
        )}
      </div>

      {result.note && <p className="text-sm text-white/60">{result.note}</p>}

      <div className="mt-1 flex gap-2">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-sprunki-accent px-4 py-2 text-center text-sm font-bold text-white transition hover:brightness-110"
        >
          View on {result.store} ↗
        </a>
        {onWant && (
          <button
            onClick={onWant}
            className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
              wanted
                ? "bg-sprunki-accent2/20 text-sprunki-accent2 ring-sprunki-accent2/40"
                : "bg-white/5 text-white/80 ring-white/10 hover:bg-white/10"
            }`}
          >
            {wanted ? "★ Wanted" : "☆ Want"}
          </button>
        )}
      </div>
    </div>
  );
}
