"use client";

import { useMemo, useState } from "react";
import {
  CHARACTERS,
  PHASES,
  VARIANTS,
  VARIANT_META,
  entryKey,
  type Variant,
} from "@/lib/sprunki";
import type { CollectionMap, CollectionStatus } from "@/hooks/useCollection";

const STATUS_FILTERS = ["all", "owned", "wanted"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const VARIANT_FILTERS = ["all", "normal", "horror"] as const;
type VariantFilter = (typeof VARIANT_FILTERS)[number];

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [variantFilter, setVariantFilter] = useState<VariantFilter>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  const counts = useMemo(() => {
    let owned = 0;
    let wanted = 0;
    for (const entry of Object.values(collection)) {
      if (entry.status === "owned") owned++;
      else if (entry.status === "wanted") wanted++;
    }
    const total = CHARACTERS.length * VARIANTS.length;
    return { owned, wanted, total };
  }, [collection]);

  // Build the full character x variant matrix, then filter.
  const items = useMemo(() => {
    const list: {
      id: string;
      name: string;
      emoji: string;
      variant: Variant;
      key: string;
    }[] = [];
    for (const c of CHARACTERS) {
      for (const v of VARIANTS) {
        list.push({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          variant: v,
          key: entryKey(c.id, v),
        });
      }
    }
    return list.filter((it) => {
      const entry = collection[it.key];
      if (variantFilter !== "all" && it.variant !== variantFilter) return false;
      if (statusFilter !== "all" && entry?.status !== statusFilter) return false;
      if (phaseFilter !== "all" && entry?.phase !== phaseFilter) return false;
      return true;
    });
  }, [collection, statusFilter, variantFilter, phaseFilter]);

  function cycle(key: string, current: CollectionStatus | undefined) {
    // none -> wanted -> owned -> none
    const next: CollectionStatus | null =
      current === undefined ? "wanted" : current === "wanted" ? "owned" : null;
    setStatus(key, next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-sprunki-lime/20 px-3 py-1 font-bold text-sprunki-lime">
          {counts.owned} owned
        </span>
        <span className="rounded-full bg-sprunki-accent2/20 px-3 py-1 font-bold text-sprunki-accent2">
          {counts.wanted} wanted
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-white/50">
          of {counts.total} (normal + horror)
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Segmented
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />
        <Segmented
          options={VARIANT_FILTERS}
          value={variantFilter}
          onChange={(v) => setVariantFilter(v as VariantFilter)}
        />
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="rounded-full bg-black/30 px-3 py-1.5 text-sm text-white/80 ring-1 ring-white/10 outline-none"
        >
          <option value="all">All phases</option>
          {PHASES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      {loading ? (
        <p className="py-10 text-center text-white/50">Loading your collection…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-white/50">
          Nothing matches these filters yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => {
            const entry = collection[it.key];
            const status = entry?.status;
            const isHorror = it.variant === "horror";
            return (
              <div
                key={it.key}
                className={`flex flex-col gap-2 rounded-2xl p-3 ring-1 transition ${
                  status === "owned"
                    ? "bg-sprunki-lime/10 ring-sprunki-lime/40"
                    : status === "wanted"
                      ? "bg-sprunki-accent2/10 ring-sprunki-accent2/40"
                      : isHorror
                        ? "bg-black/30 ring-white/10"
                        : "bg-sprunki-panel/60 ring-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{it.emoji}</span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{it.name}</p>
                    <span
                      className={`text-xs font-bold ${
                        isHorror ? "text-red-300" : "text-sprunki-lime"
                      }`}
                    >
                      {VARIANT_META[it.variant].emoji} {VARIANT_META[it.variant].label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => cycle(it.key, status)}
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
                    onChange={(e) => setStatus(it.key, status, e.target.value || null)}
                    className="rounded-lg bg-black/30 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10 outline-none"
                  >
                    <option value="">Phase?</option>
                    {PHASES.map((p) => (
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

function Segmented({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-black/30 p-1 ring-1 ring-white/10">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-3 py-1 text-sm capitalize transition ${
            value === o ? "bg-sprunki-accent text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
