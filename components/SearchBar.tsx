"use client";

import { useState } from "react";
import { CHARACTERS, PHASES } from "@/lib/sprunki";

export default function SearchBar({
  onSearch,
  busy,
}: {
  onSearch: (query: string) => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q && !busy) onSearch(q);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Wenda Phase 5 plush"
          className="min-w-0 flex-1 rounded-full bg-black/30 px-5 py-3 text-base outline-none ring-1 ring-white/10 focus:ring-sprunki-accent2"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="rounded-full bg-sprunki-accent px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Scouting…" : "Find it"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {CHARACTERS.slice(0, 8).map((c) => (
          <button
            key={c.id}
            disabled={busy}
            onClick={() => {
              const q = `${c.name} plush`;
              setValue(q);
              onSearch(q);
            }}
            className="rounded-full bg-white/5 px-3 py-1.5 text-sm ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-50"
          >
            {c.emoji} {c.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40">
        Tip: add a phase to narrow it down — {PHASES.slice(0, 5).join(", ")}.
      </p>
    </div>
  );
}
