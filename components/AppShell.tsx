"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCollection } from "@/hooks/useCollection";
import { CHARACTERS, entryKey, type Variant } from "@/lib/sprunki";
import type { FinderResponse, FinderResult } from "@/lib/types";
import SearchBar from "./SearchBar";
import ResultCard from "./ResultCard";
import StoreLinks from "./StoreLinks";
import CollectionGrid from "./CollectionGrid";

type Tab = "finder" | "collection";

/** Best-effort match of a finder result's character name to a roster id. */
function matchCharacterId(name: string): string | null {
  const n = name.toLowerCase().trim();
  if (!n) return null;
  for (const c of CHARACTERS) {
    const first = c.name.toLowerCase().split(" ")[0].replace(/[()]/g, "");
    if (first.length >= 3 && (n.includes(first) || first.includes(n))) return c.id;
  }
  return null;
}

/** Map a finder result to the character + variant (normal/horror) it best fits. */
function resultToEntry(result: FinderResult): { key: string; phase: string | null } | null {
  const id = matchCharacterId(result.character) ?? matchCharacterId(result.title);
  if (!id) return null;
  const haystack = `${result.title} ${result.character} ${result.note}`.toLowerCase();
  const variant: Variant = /horror|scary|infected|corrupt/.test(haystack)
    ? "horror"
    : "normal";
  const phase = /phase\s*\d/i.test(result.phase) ? result.phase : null;
  return { key: entryKey(id, variant), phase };
}

export default function AppShell({
  email,
  syncAvailable,
}: {
  email: string | null;
  syncAvailable: boolean;
}) {
  const { collection, loading, error, setStatus } = useCollection();

  const [tab, setTab] = useState<Tab>("finder");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<FinderResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Whether the optional AI finder is available (an Anthropic key is set).
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((h) => setAiAvailable(!!h?.checks?.anthropic))
      .catch(() => setAiAvailable(false));
  }, []);

  async function search(q: string) {
    // Store links show instantly (client-side, no key needed).
    setQuery(q);
    setSearchError(null);
    setResponse(null);

    // Only call the AI finder if a key is configured.
    if (!aiAvailable) return;

    setBusy(true);
    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as FinderResponse;
      if (!res.ok || data.error) {
        setSearchError(data.error ?? "AI search failed — the store links above still work.");
      } else {
        setResponse(data);
      }
    } catch {
      setSearchError("Couldn't reach the AI finder — the store links above still work.");
    } finally {
      setBusy(false);
    }
  }

  function want(result: FinderResult) {
    const entry = resultToEntry(result);
    if (entry) setStatus(entry.key, "wanted", entry.phase);
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-sprunki-accent">
            SprunkFind 🧸
          </h1>
          <p className="text-xs text-white/50">
            {email ? `Synced as ${email}` : "Saved on this device"}
          </p>
        </div>
        {email ? (
          <button
            onClick={signOut}
            className="rounded-full bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Sign out
          </button>
        ) : syncAvailable ? (
          <a
            href="/login"
            className="rounded-full bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Sign in to sync
          </a>
        ) : null}
      </header>

      <div className="mb-6 flex gap-1 rounded-full bg-black/30 p-1 ring-1 ring-white/10">
        {(["finder", "collection"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-bold capitalize transition ${
              tab === t ? "bg-sprunki-accent text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {t === "finder" ? "🔎 Finder" : "🧸 Collection"}
          </button>
        ))}
      </div>

      {tab === "finder" ? (
        <section className="space-y-5">
          <SearchBar onSearch={search} busy={busy} />

          {/* Instant, no-key store searches. */}
          {query && <StoreLinks query={query} />}

          {/* Optional AI-curated results, only when a key is configured. */}
          {query && aiAvailable && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white/80">
                ✨ AI-picked matches
              </p>

              {busy && (
                <p className="py-6 text-center text-white/50">
                  🔦 The AI scout is searching the web…
                </p>
              )}

              {searchError && (
                <p className="rounded-xl bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
                  {searchError}
                </p>
              )}

              {response && (
                <div className="space-y-3">
                  {response.summary && (
                    <p className="text-sm text-white/70">{response.summary}</p>
                  )}
                  {response.results.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {response.results.map((r, i) => {
                        const entry = resultToEntry(r);
                        const wanted = entry
                          ? collection[entry.key]?.status === "wanted"
                          : false;
                        return (
                          <ResultCard
                            key={`${r.url}-${i}`}
                            result={r}
                            onWant={entry ? () => want(r) : undefined}
                            wanted={wanted}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Gentle hint that the AI upgrade exists but isn't required. */}
          {query && aiAvailable === false && (
            <p className="rounded-xl bg-white/5 px-4 py-3 text-xs text-white/50 ring-1 ring-white/10">
              💡 Optional: add an Anthropic API key to also get AI-picked exact
              matches with prices. The store searches above work without it.
            </p>
          )}
        </section>
      ) : (
        <CollectionGrid
          collection={collection}
          loading={loading}
          error={error}
          setStatus={setStatus}
        />
      )}
    </main>
  );
}
