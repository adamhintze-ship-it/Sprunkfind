"use client";

import { storeSearchLinks } from "@/lib/storeLinks";

export default function StoreLinks({ query }: { query: string }) {
  const links = storeSearchLinks(query);
  return (
    <div className="rounded-2xl bg-sprunki-panel/60 p-4 ring-1 ring-white/10">
      <p className="mb-3 text-sm font-semibold text-white/80">
        🛍️ Search the stores for{" "}
        <span className="text-sprunki-accent2">&ldquo;{query}&rdquo;</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.domain}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/10"
          >
            {l.emoji} {l.name} ↗
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">
        These open real store searches — no account or key needed.
      </p>
    </div>
  );
}
