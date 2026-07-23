"use client";

import { useEffect, useState } from "react";

interface Health {
  ready: boolean;
  checks: {
    anthropic: boolean;
    supabase: boolean;
    database: "ok" | "missing" | "unknown";
    google: boolean;
  };
  model: string;
}

const SCHEMA_SQL = `create table if not exists public.collections (
  user_id      uuid not null references auth.users (id) on delete cascade,
  character_id text not null,
  status       text not null check (status in ('owned', 'wanted')),
  phase        text,
  updated_at   timestamptz not null default now(),
  primary key (user_id, character_id)
);
alter table public.collections enable row level security;
drop policy if exists "own rows" on public.collections;
create policy "own rows" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

export default function SetupChecklist() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      setHealth(await res.json());
    } catch {
      setHealth(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const c = health?.checks;
  const dbOk = c?.database === "ok";
  const dbMissing = c?.database === "missing";

  return (
    <div className="space-y-4">
      {health?.ready && (
        <div className="rounded-2xl bg-sprunki-lime/15 p-4 text-center ring-1 ring-sprunki-lime/40">
          <p className="font-bold text-sprunki-lime">🎉 All set — you&apos;re ready!</p>
          <a
            href="/"
            className="mt-2 inline-block rounded-full bg-sprunki-accent px-5 py-2 text-sm font-bold text-white"
          >
            Open SprunkFind →
          </a>
        </div>
      )}

      <ul className="space-y-2">
        <Item
          ok={!!c?.anthropic}
          optional
          title="Anthropic API key (optional)"
          okText="Configured — AI-picked matches are enabled."
          badText="Not set — the finder still works via store-search links. Add ANTHROPIC_API_KEY only if you also want AI-picked matches with prices."
        />
        <Item
          ok={!!c?.supabase}
          title="Supabase connection"
          okText="Project URL and anon key are set."
          badText="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        />
        <Item
          ok={dbOk}
          title="Database table"
          okText="The collections table exists with Row-Level Security."
          badText={
            dbMissing
              ? "Table not found — run the SQL below in Supabase (SQL Editor)."
              : "Can't verify the table yet — connect Supabase first."
          }
        />
        <Item
          ok={!!c?.google}
          optional
          title="Google sign-in (optional)"
          okText="Enabled. Email + password also works."
          badText="Not enabled — email + password login still works out of the box. To add Google, enable the provider in Supabase and set NEXT_PUBLIC_GOOGLE_ENABLED=true."
        />
      </ul>

      {(dbMissing || loading || !c?.supabase) && (
        <div className="rounded-2xl bg-sprunki-panel/70 p-4 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">
              Database SQL — paste into Supabase → SQL Editor → Run
            </p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(SCHEMA_SQL);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-full bg-sprunki-accent px-3 py-1 text-xs font-bold text-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-white/80">
            {SCHEMA_SQL}
          </pre>
        </div>
      )}

      <button
        onClick={refresh}
        disabled={loading}
        className="w-full rounded-full bg-white/5 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/10 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Re-check setup"}
      </button>

      <p className="text-center text-xs text-white/40">
        Finder model: {health?.model ?? "…"} · <a href="/login" className="underline">Go to login</a>
      </p>
    </div>
  );
}

function Item({
  ok,
  optional,
  title,
  okText,
  badText,
}: {
  ok: boolean;
  optional?: boolean;
  title: string;
  okText: string;
  badText: string;
}) {
  return (
    <li
      className={`flex gap-3 rounded-2xl p-3 ring-1 ${
        ok
          ? "bg-sprunki-lime/10 ring-sprunki-lime/30"
          : optional
            ? "bg-white/5 ring-white/10"
            : "bg-red-500/10 ring-red-500/30"
      }`}
    >
      <span className="text-lg">{ok ? "✅" : optional ? "➖" : "❌"}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-white/60">{ok ? okText : badText}</p>
      </div>
    </li>
  );
}
