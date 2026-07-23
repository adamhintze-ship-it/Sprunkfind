"use client";

import { useMemo, useState } from "react";
import { CHARACTERS, PHASES } from "@/lib/sprunki";
import type {
  CollectionMap,
  CollectionStatus,
} from "@/hooks/useCollection";

const FILTERS = ["all", "owned", "wanted"] as const;
type Filter = (typeof FILTERS)[number];

export default function CollectionGrid({
  collection,
  loading,
  error,
  setStatus,
}: {
  collection: CollectionMap;
  loading: boolean;
  error: string | null;
  setStatus: (
    id: string,
    status: CollectionStatus | null,
    phase?: string | null,
  ) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    let owned = 0;
    let wanted = 0;
    for (const entry of Object.values(collection)) {
      if (entry.status === "owned") owned++;
      else if (entry.status === "wanted") wanted++;
    }
    return { owned, wanted };
  }, [collection]);

  const visible = CHARACTERS.filter((c) => {
    const status = collection[c.id]?.status;
    if (filter === "owned") return status === "owned";
    if (filter === "wanted") return status === "wanted";
    return true;
  });

  function cycle(id: string, current: CollectionStatus | undefined) {
    // none -> wanted -> owned -> none
    const next: CollectionStatus | null =
      current === undefined ? "wanted" : current === "wanted" ? "owned" : null;
    setStatus(id, next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-sprunki-lime/20 px-3 py-1 font-bold text-sprunki-lime">
            {counts.owned} owned
          </span>
          <span className="rounded-full bg-sprunki-accent2/20 px-3 py-1 font-bold text-sprunki-accent2">
            {counts.wanted} wanted
          </span>
        </div>
        <div className="flex gap-1 rounded-full bg-black/30 p-1 ring-1 ring-white/10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm capitalize transition ${
                filter === f ? "bg-sprunki-accent text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
      {loading ? (
        <p className="py-10 text-center text-white/50">Loading your collection…</p>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-white/50">
          Nothing here yet. Tap a character to add it.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((c) => {
            const entry = collection[c.id];
            const status = entry?.status;
            return (
              <div
                key={c.id}
                className={`flex flex-col gap-2 rounded-2xl p-3 ring-1 transition ${
                  status === "owned"
                    ? "bg-sprunki-lime/10 ring-sprunki-lime/40"
                    : status === "wanted"
                      ? "bg-sprunki-accent2/10 ring-sprunki-accent2/40"
                      : "bg-sprunki-panel/60 ring-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-sm font-semibold leading-tight">{c.name}</span>
                </div>
                <p className="text-xs text-white/50">{c.blurb}</p>

                <button
                  onClick={() => cycle(c.id, status)}
                  className={`mt-auto rounded-full px-3 py-1.5 text-sm font-bold transition ${
                    status === "owned"
                      ? "bg-sprunki-lime text-black"
                      : status === "wanted"
                        ? "bg-sprunki-accent2 text-black"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {status === "owned" ? "✓ Owned" : status === "wanted" ? "★ Wanted" : "+ Add"}
                </button>

                {status && (
                  <select
                    value={entry?.phase ?? ""}
                    onChange={(e) => setStatus(c.id, status, e.target.value || null)}
                    className="rounded-lg bg-black/30 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10 outline-none"
                  >
                    <option value="">Phase?</option>
                    {PHASES.filter((p) => p !== "Any / Not sure").map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
