"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCollection } from "@/hooks/useCollection";
import { CHARACTERS } from "@/lib/sprunki";
import type { FinderResponse, FinderResult } from "@/lib/types";
import SearchBar from "./SearchBar";
import ResultCard from "./ResultCard";
import CollectionGrid from "./CollectionGrid";

type Tab = "finder" | "collection";

/** Best-effort match of a finder result's character name to a roster id. */
function matchCharacterId(name: string): string | null {
  const n = name.toLowerCase();
  for (const c of CHARACTERS) {
    const first = c.name.toLowerCase().split(" ")[0];
    if (n.includes(first) || first.includes(n)) return c.id;
  }
  return null;
}

export default function AppShell({ email }: { email: string }) {
  const supabase = createClient();
  const { collection, loading, error, setStatus } = useCollection();

  const [tab, setTab] = useState<Tab>("finder");
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<FinderResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function search(query: string) {
    setBusy(true);
    setSearchError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await res.json()) as FinderResponse;
      if (!res.ok || data.error) {
        setSearchError(data.error ?? "Search failed. Please try again.");
      } else {
        setResponse(data);
      }
    } catch {
      setSearchError("Couldn't reach the finder. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function want(result: FinderResult) {
    const id = matchCharacterId(result.character) ?? matchCharacterId(result.title);
    if (id) {
      const phase = /phase\s*\d/i.test(result.phase) ? result.phase : null;
      setStatus(id, "wanted", phase);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-sprunki-accent">
            SprunkFind 🧸
          </h1>
          <p className="text-xs text-white/50">Signed in as {email}</p>
        </div>
        <button
          onClick={signOut}
          className="rounded-full bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:bg-white/10"
        >
          Sign out
        </button>
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

          {searchError && (
            <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {searchError}
            </p>
          )}

          {busy && (
            <p className="py-8 text-center text-white/50">
              🔦 Searching stores across the web…
            </p>
          )}

          {response && (
            <div className="space-y-3">
              <p className="text-sm text-white/70">{response.summary}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {response.results.map((r, i) => {
                  const id = matchCharacterId(r.character) ?? matchCharacterId(r.title);
                  const wanted = id ? collection[id]?.status === "wanted" : false;
                  return (
                    <ResultCard
                      key={`${r.url}-${i}`}
                      result={r}
                      onWant={id ? () => want(r) : undefined}
                      wanted={wanted}
                    />
                  );
                })}
              </div>
            </div>
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
