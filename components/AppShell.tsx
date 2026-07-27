"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCollection } from "@/hooks/useCollection";
import {
  CHARACTERS,
  PHASES,
  SERIES,
  VARIANTS,
  artFor,
  entryKey,
  hasHorror,
  type Series,
  type SprunkiCharacter,
  type Variant,
} from "@/lib/sprunki";
import { storeSearchLinks } from "@/lib/storeLinks";
import type { FinderResponse, FinderResult } from "@/lib/types";
import SprunkiArt from "./SprunkiAvatar";

interface Item {
  key: string;
  char: SprunkiCharacter;
  variant: Variant;
}

const ALL_ITEMS: Item[] = CHARACTERS.flatMap((char) =>
  VARIANTS.filter((v) => v === "normal" || hasHorror(char)).map((variant) => ({
    key: entryKey(char.id, variant),
    char,
    variant,
  })),
);

export default function AppShell({
  email,
  syncAvailable,
}: {
  email: string | null;
  syncAvailable: boolean;
}) {
  const { collection, loading, setStatus } = useCollection();

  const [query, setQuery] = useState("");
  const [wishOnly, setWishOnly] = useState(false);
  const [editionFilter, setEditionFilter] = useState<"all" | Variant>("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "owned" | "wanted" | "none">("all");
  const [selected, setSelected] = useState<Item | null>(null);
  const [huntOpen, setHuntOpen] = useState(false);

  const wishCount = useMemo(
    () => Object.values(collection).filter((e) => e.status === "wanted").length,
    [collection],
  );
  const ownedCount = useMemo(
    () => Object.values(collection).filter((e) => e.status === "owned").length,
    [collection],
  );

  const cards = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ITEMS.filter((it) => {
      const entry = collection[it.key];
      if (wishOnly && entry?.status !== "wanted") return false;
      if (editionFilter !== "all" && it.variant !== editionFilter) return false;
      if (phaseFilter !== "all" && `Phase ${it.char.phase}` !== phaseFilter) return false;
      if (statusFilter === "none" && entry) return false;
      if (statusFilter !== "all" && statusFilter !== "none" && entry?.status !== statusFilter)
        return false;
      if (
        q &&
        !it.char.name.toLowerCase().includes(q) &&
        !it.char.series.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [collection, query, wishOnly, editionFilter, phaseFilter, statusFilter]);

  function toggleWish(key: string) {
    setStatus(key, collection[key]?.status === "wanted" ? null : "wanted");
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background:
          "radial-gradient(1200px 700px at 50% -10%, #1b1146 0%, #0c0920 45%, #0a0718 100%)",
        overflow: "hidden",
      }}
    >
      <Orb top={-120} left={-100} size={460} color="#7b3dff88" dur="14s" />
      <Orb top={120} right={-140} size={420} color="#ff3d9a66" dur="18s" reverse />
      <Orb top="60%" left="30%" size={360} color="#2ee0ff44" dur="20s" blur={40} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 0 8px",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(145deg,#ff5db1,#8a4dff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(255,93,177,.35)",
                fontSize: 22,
              }}
            >
              🧸
            </div>
            <div
              className="font-display"
              style={{ fontWeight: 700, fontSize: 22, letterSpacing: ".3px" }}
            >
              Sprunki<span style={{ color: "#ff5db1" }}>Finder</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {email ? (
              <button onClick={signOut} style={ghostBtn}>
                Sign out
              </button>
            ) : syncAvailable ? (
              <a href="/login" style={{ ...ghostBtn, color: "#c9bfff" }}>
                Sign in to sync
              </a>
            ) : null}
            <button
              onClick={() => setWishOnly((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: wishOnly ? "#2a1a4a" : "#1a1340",
                border: `2px solid rgba(255,93,177,${wishOnly ? ".7" : ".35"})`,
                padding: "9px 16px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                color: "#ffc4e6",
              }}
            >
              <Heart filled />
              <span>My Collection</span>
              <span
                style={{
                  background: "#ff5db1",
                  color: "#160f2e",
                  minWidth: 22,
                  height: 22,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  padding: "0 6px",
                }}
              >
                {wishCount}
              </span>
            </button>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section style={{ textAlign: "center", padding: "48px 0 30px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(46,224,255,.14)",
              border: "1px solid rgba(46,224,255,.35)",
              color: "#7fecff",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "7px 15px",
              borderRadius: 999,
              marginBottom: 22,
            }}
          >
            The plushie tracker for real collectors
          </div>
          <h1
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: "clamp(40px,7vw,76px)",
              lineHeight: 1.02,
              letterSpacing: "-1px",
              margin: "0 auto",
              maxWidth: 820,
            }}
          >
            Gotta collect
            <br />
            <span
              style={{
                background: "linear-gradient(100deg,#ff5db1,#8b5cff 55%,#2ee0ff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              &apos;em all.
            </span>
          </h1>
          <p
            style={{
              color: "#b6acdf",
              fontSize: "clamp(16px,2.2vw,20px)",
              fontWeight: 600,
              maxWidth: 560,
              margin: "18px auto 0",
            }}
          >
            See which Sprunki plushies exist, where to buy them, and track every one
            you own.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: 560,
              margin: "34px auto 0",
              background: "#1c1550",
              border: "2.5px solid rgba(139,92,255,.4)",
              borderRadius: 999,
              padding: "8px 8px 8px 22px",
              boxShadow: "0 20px 60px rgba(123,61,255,.28)",
            }}
          >
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find your plushie..."
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f3efff",
                fontSize: 17,
                fontWeight: 600,
                padding: "8px 4px",
              }}
            />
            <button
              onClick={() => setHuntOpen(true)}
              style={{
                background: "linear-gradient(100deg,#ff5db1,#8b5cff)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                padding: "12px 24px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          {/* bobbing crew */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              gap: 6,
              marginTop: 44,
              flexWrap: "wrap",
              minHeight: 120,
            }}
          >
            {CHARACTERS.slice(0, 8).map((c, i) => (
              <div
                key={c.id}
                className="crew anim-bob"
                style={{ width: 74, height: 104, animationDelay: `${i * 0.18}s` }}
                title={c.name}
              >
                <SprunkiArt src={c.img} color={c.color} face={c.face} feat={c.feat} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Sticky filter bar ──────────────────────────────────── */}
        <section>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              background: "rgba(12,9,32,.82)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,255,.18)",
              borderRadius: 22,
              padding: "16px 18px",
              marginBottom: 26,
              boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Chip
                  label="All"
                  dot="#8b5cff"
                  active={statusFilter === "all"}
                  onClick={() => setStatusFilter("all")}
                />
                <Chip
                  label={`Owned ${ownedCount}`}
                  dot="#3ff0a0"
                  active={statusFilter === "owned"}
                  onClick={() => setStatusFilter("owned")}
                />
                <Chip
                  label={`Wanted ${wishCount}`}
                  dot="#ff5db1"
                  active={statusFilter === "wanted"}
                  onClick={() => setStatusFilter("wanted")}
                />
                <Chip
                  label="Not collected"
                  dot="#6b6294"
                  active={statusFilter === "none"}
                  onClick={() => setStatusFilter("none")}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <select
                  value={editionFilter}
                  onChange={(e) => setEditionFilter(e.target.value as "all" | Variant)}
                  style={selectStyle}
                >
                  <option value="all">All editions</option>
                  <option value="normal">Normal Edition</option>
                  <option value="horror">Horror Edition</option>
                </select>
                <select
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All phases</option>
                  {PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h2 className="font-display" style={{ fontWeight: 700, fontSize: 26 }}>
              {wishOnly ? "My Collection" : "All Sprunki plushies"}
            </h2>
            <div style={{ color: "#9a8fca", fontWeight: 700, fontSize: 14 }}>
              {cards.length} plushies{wishOnly ? " wanted" : ""}
              {loading ? " · syncing…" : ""}
            </div>
          </div>

          {cards.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "70px 20px",
                background: "#140f34",
                border: "2px dashed rgba(139,92,255,.3)",
                borderRadius: 24,
              }}
            >
              <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 8 }}>🫥</div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>
                No plushies match that.
              </div>
              <div style={{ color: "#9a8fca", fontWeight: 600, marginTop: 6 }}>
                Not in our list? Send the hunters after it.
              </div>
              <button
                onClick={() => setHuntOpen(true)}
                style={{
                  marginTop: 18,
                  background: "linear-gradient(100deg,#2ee0ff,#8b5cff)",
                  color: "#08202a",
                  fontWeight: 800,
                  fontSize: 14.5,
                  padding: "12px 22px",
                  borderRadius: 999,
                }}
              >
                🔎 Hunt for a plushie
              </button>
            </div>
          )}

          {/* ── Card grid ────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))",
              gap: 22,
            }}
          >
            {cards.map((it, idx) => (
              <PlushCard
                key={it.key}
                item={it}
                index={idx}
                status={collection[it.key]?.status}
                phase={collection[it.key]?.phase ?? null}
                onOpen={() => setSelected(it)}
                onToggleWish={() => toggleWish(it.key)}
              />
            ))}

            <div
              onClick={() => setHuntOpen(true)}
              className="card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 10,
                minHeight: 340,
                background:
                  "linear-gradient(180deg,rgba(46,224,255,.06),rgba(139,92,255,.05))",
                border: "2px dashed rgba(46,224,255,.35)",
                borderRadius: 26,
                padding: 20,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(46,224,255,.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7fecff",
                  fontSize: 28,
                }}
              >
                +
              </div>
              <div
                className="font-display"
                style={{ fontWeight: 600, fontSize: 19, color: "#eafcff" }}
              >
                Character not listed?
              </div>
              <div
                style={{ color: "#9fb6c4", fontWeight: 700, fontSize: 13.5, maxWidth: 200 }}
              >
                Hunt the marketplaces for any Sprunki and we&apos;ll find it.
              </div>
            </div>
          </div>
        </section>

        <footer
          style={{
            textAlign: "center",
            color: "#6b6294",
            fontWeight: 700,
            fontSize: 13,
            marginTop: 60,
            lineHeight: 1.6,
          }}
        >
          Sprunki Collection Finder — a fan-made discovery tool.
          <br />
          {email
            ? "Your collection syncs to your account."
            : "Your collection is saved on this device."}
        </footer>
      </div>

      {selected && (
        <DetailModal
          item={selected}
          status={collection[selected.key]?.status}
          phase={collection[selected.key]?.phase ?? null}
          onClose={() => setSelected(null)}
          onSetStatus={(s, p) => setStatus(selected.key, s, p)}
        />
      )}

      {huntOpen && <HuntModal initial={query} onClose={() => setHuntOpen(false)} />}
    </div>
  );
}

/* ─────────────────────────── Card ─────────────────────────── */

function PlushCard({
  item,
  index,
  status,
  phase,
  onOpen,
  onToggleWish,
}: {
  item: Item;
  index: number;
  status?: "owned" | "wanted";
  phase: string | null;
  onOpen: () => void;
  onToggleWish: () => void;
}) {
  const horror = item.variant === "horror";
  const color = horror ? "#ff5f5f" : item.char.color;
  const st =
    status === "owned"
      ? { label: "Owned", bg: "rgba(63,240,160,.18)", fg: "#3ff0a0" }
      : status === "wanted"
        ? { label: "Wanted", bg: "rgba(255,93,177,.2)", fg: "#ff5db1" }
        : { label: "Not yet", bg: "rgba(107,98,148,.25)", fg: "#b6acdf" };

  return (
    <div
      onClick={onOpen}
      className="card-hover anim-popin"
      style={{
        position: "relative",
        background: "linear-gradient(180deg,#181140,#120c30)",
        border: "1.5px solid rgba(139,92,255,.18)",
        borderRadius: 26,
        padding: 16,
        cursor: "pointer",
        animationDelay: `${Math.min(index, 12) * 0.03}s`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 26,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: st.bg,
          color: st.fg,
          fontWeight: 800,
          fontSize: 11.5,
          letterSpacing: ".4px",
          textTransform: "uppercase",
          padding: "6px 11px",
          borderRadius: 999,
          boxShadow: "0 6px 16px rgba(0,0,0,.3)",
        }}
      >
        <span
          style={{ width: 8, height: 8, borderRadius: "50%", background: st.fg }}
        />
        {st.label}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWish();
        }}
        aria-label="Toggle wanted"
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 3,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(10,7,24,.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid rgba(255,255,255,.12)",
        }}
      >
        <Heart filled={status === "wanted"} />
      </button>

      <div
        style={{
          borderRadius: 20,
          padding: "20px 10px 10px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          height: 210,
          background: horror
            ? "linear-gradient(180deg,#2a0f1a,#140a18)"
            : `linear-gradient(180deg,${hexA(item.char.color, 0.22)},rgba(20,12,45,.4))`,
          overflow: "hidden",
        }}
      >
        <div style={{ width: 132, height: 172 }}>
          <SprunkiArt
            src={artFor(item.char, item.variant)}
            color={item.char.color}
            face={item.char.face}
            feat={item.char.feat}
            horror={horror}
          />
        </div>
      </div>

      <div style={{ padding: "14px 4px 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: horror ? "#ff9d9d" : "#c9f7d8",
              background: horror ? "rgba(255,59,59,.16)" : "rgba(63,240,160,.14)",
              padding: "3px 9px",
              borderRadius: 999,
              letterSpacing: ".3px",
              textTransform: "uppercase",
            }}
          >
            {horror ? "Horror Edition" : "Normal Edition"}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: "#8f84c9",
              background: "#1a1340",
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            Phase {item.char.phase}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div
            className="font-display"
            style={{ fontWeight: 700, fontSize: 21, lineHeight: 1 }}
          >
            {item.char.name}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color,
              background: hexA(color, 0.14),
              padding: "4px 9px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {item.char.series}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 13,
          }}
        >
          <div>
            <div style={{ color: "#8f84c9", fontSize: 12, fontWeight: 700 }}>
              Find it at
            </div>
            <div
              className="font-display"
              style={{ fontWeight: 700, fontSize: 20 }}
            >
              5 stores
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: "#8f84c9",
              fontSize: 12.5,
              fontWeight: 800,
              background: "#1e1650",
              padding: "8px 12px",
              borderRadius: 12,
            }}
          >
            Compare ›
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Detail modal ───────────────────── */

function DetailModal({
  item,
  status,
  phase,
  onClose,
  onSetStatus,
}: {
  item: Item;
  status?: "owned" | "wanted";
  phase: string | null;
  onClose: () => void;
  onSetStatus: (s: "owned" | "wanted" | null, phase?: string | null) => void;
}) {
  const horror = item.variant === "horror";
  const links = storeSearchLinks(
    `${item.char.name} ${horror ? "horror" : ""} ${phase ?? ""}`.trim(),
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(6,4,16,.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "popin .22s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          background: "linear-gradient(180deg,#1a1244,#110b2e)",
          border: "1.5px solid rgba(139,92,255,.3)",
          borderRadius: 28,
          boxShadow: "0 40px 100px rgba(0,0,0,.6)",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            gap: 18,
            padding: "24px 24px 20px",
            alignItems: "center",
            background: horror
              ? "linear-gradient(180deg,#3a1020,#1a0a18)"
              : `linear-gradient(180deg,${hexA(item.char.color, 0.35)},rgba(20,12,45,.5))`,
            borderRadius: "28px 28px 0 0",
          }}
        >
          <div style={{ width: 92, height: 120, flexShrink: 0 }} className="anim-bob">
            <SprunkiArt
              src={artFor(item.char, item.variant)}
              color={item.char.color}
              face={item.char.face}
              feat={item.char.feat}
              horror={horror}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}
            >
              <Pill>{horror ? "Horror Edition" : "Normal Edition"}</Pill>
              <Pill>{item.char.series}</Pill>
              {phase && <Pill>{phase}</Pill>}
            </div>
            <div
              className="font-display"
              style={{ fontWeight: 700, fontSize: 32, lineHeight: 1, color: "#fff" }}
            >
              {item.char.name}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.85)",
                fontWeight: 700,
                fontSize: 14,
                marginTop: 6,
              }}
            >
              {`${item.char.series} · Phase ${item.char.phase}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(0,0,0,.35)",
              color: "#fff",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "22px 24px 26px" }}>
          <div
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "#9a8fca",
              letterSpacing: ".5px",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Compare retailers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {links.map((l) => (
              <a
                key={l.domain}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "#160f38",
                  border: "1.5px solid rgba(139,92,255,.25)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  color: "#f3efff",
                }}
              >
                <span style={{ fontSize: 20 }}>{l.emoji}</span>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 16 }}>{l.name}</span>
                <span
                  style={{
                    background: "linear-gradient(100deg,#ff5db1,#8b5cff)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13.5,
                    padding: "10px 16px",
                    borderRadius: 12,
                  }}
                >
                  Search ↗
                </span>
              </a>
            ))}
          </div>

          <div
            className="font-display"
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: "#9a8fca",
              letterSpacing: ".5px",
              textTransform: "uppercase",
              margin: "22px 0 10px",
            }}
          >
            Which phase?
          </div>
          <select
            value={phase ?? ""}
            onChange={(e) => onSetStatus(status ?? "wanted", e.target.value || null)}
            style={{ ...selectStyle, width: "100%" }}
          >
            <option value="">Not set</option>
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button
              onClick={() => onSetStatus(status === "wanted" ? null : "wanted")}
              style={{
                flex: 1,
                background: status === "wanted" ? "#ff5db1" : "transparent",
                color: status === "wanted" ? "#160f2e" : "#ff9dd0",
                border: "2px solid #ff5db1",
                fontWeight: 800,
                fontSize: 15,
                padding: 14,
                borderRadius: 16,
              }}
            >
              {status === "wanted" ? "★ Wanted" : "☆ Want this"}
            </button>
            <button
              onClick={() => onSetStatus(status === "owned" ? null : "owned")}
              style={{
                flex: 1,
                background: status === "owned" ? "#3ff0a0" : "transparent",
                color: status === "owned" ? "#08321f" : "#8ff5c6",
                border: "2px solid #3ff0a0",
                fontWeight: 800,
                fontSize: 15,
                padding: 14,
                borderRadius: 16,
              }}
            >
              {status === "owned" ? "✓ Owned" : "Mark owned"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Hunt (finder) modal ──────────────── */

function HuntModal({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [name, setName] = useState(initial);
  const [submitted, setSubmitted] = useState(initial.trim());
  const [aiAvailable, setAiAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<FinderResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((h) => setAiAvailable(!!h?.checks?.anthropic))
      .catch(() => setAiAvailable(false));
  }, []);

  async function run() {
    const q = name.trim();
    if (!q) return;
    setSubmitted(q);
    setRes(null);
    setErr(null);
    if (!aiAvailable) return;
    setBusy(true);
    try {
      const r = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const d = (await r.json()) as FinderResponse;
      if (!r.ok || d.error) setErr(d.error ?? "AI search failed — store links still work.");
      else setRes(d);
    } catch {
      setErr("Couldn't reach the AI finder — store links still work.");
    } finally {
      setBusy(false);
    }
  }

  const links = submitted ? storeSearchLinks(submitted) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(6,4,16,.74)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "popin .22s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          background: "linear-gradient(180deg,#141a3e,#0f0b2a)",
          border: "1.5px solid rgba(46,224,255,.28)",
          borderRadius: 28,
          boxShadow: "0 40px 100px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ padding: "24px 24px 6px", position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(46,224,255,.14)",
              color: "#7fecff",
              fontWeight: 800,
              fontSize: 11.5,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: 999,
            }}
          >
            🔎 Plushie hunt
          </div>
          <div
            className="font-display"
            style={{ fontWeight: 700, fontSize: 26, marginTop: 12, color: "#fff" }}
          >
            Find a missing character
          </div>
          <div
            style={{ color: "#9fb0d0", fontWeight: 600, fontSize: 14, marginTop: 6 }}
          >
            Type a name and we&apos;ll scour the marketplaces for it.
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
              color: "#fff",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "16px 24px 24px" }}>
          <label
            style={{
              display: "block",
              fontWeight: 800,
              fontSize: 12.5,
              color: "#8fa0c0",
              textTransform: "uppercase",
              letterSpacing: ".6px",
              marginBottom: 8,
            }}
          >
            Character name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. Simon, Wenda, Durple…"
            style={{
              width: "100%",
              background: "#0c0920",
              border: "2px solid rgba(139,92,255,.35)",
              borderRadius: 14,
              color: "#f3efff",
              fontSize: 16,
              fontWeight: 600,
              padding: "13px 15px",
              outline: "none",
            }}
          />
          <button
            onClick={run}
            disabled={!name.trim()}
            style={{
              width: "100%",
              marginTop: 14,
              background: "linear-gradient(100deg,#2ee0ff,#8b5cff)",
              color: "#08202a",
              fontWeight: 800,
              fontSize: 15,
              padding: 14,
              borderRadius: 16,
              opacity: name.trim() ? 1 : 0.5,
            }}
          >
            🔎 Hunt for it
          </button>

          {links.length > 0 && (
            <>
              <div
                className="font-display"
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#9a8fca",
                  letterSpacing: ".5px",
                  textTransform: "uppercase",
                  margin: "22px 0 10px",
                }}
              >
                Search these stores
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {links.map((l) => (
                  <a
                    key={l.domain}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#160f38",
                      border: "1.5px solid rgba(139,92,255,.25)",
                      borderRadius: 999,
                      padding: "10px 16px",
                      fontWeight: 800,
                      fontSize: 13.5,
                      color: "#e4deff",
                    }}
                  >
                    {l.emoji} {l.name} ↗
                  </a>
                ))}
              </div>
            </>
          )}

          {busy && (
            <p style={{ marginTop: 16, color: "#9fb0d0", fontWeight: 700 }}>
              🔦 The AI scout is searching…
            </p>
          )}
          {err && (
            <p
              style={{
                marginTop: 16,
                background: "rgba(255,207,77,.12)",
                color: "#ffe4a3",
                padding: "10px 14px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13.5,
              }}
            >
              {err}
            </p>
          )}
          {res && res.results.length > 0 && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: "#9fb0d0", fontWeight: 700, fontSize: 13.5 }}>
                {res.summary}
              </div>
              {res.results.map((r: FinderResult, i) => (
                <a
                  key={`${r.url}-${i}`}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#160f38",
                    border: "1.5px solid rgba(46,224,255,.22)",
                    borderRadius: 16,
                    padding: "12px 14px",
                    color: "#f3efff",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{r.title}</div>
                  <div
                    style={{ color: "#9fb0d0", fontWeight: 700, fontSize: 12.5, marginTop: 4 }}
                  >
                    {r.price} · {r.domain}
                  </div>
                </a>
              ))}
            </div>
          )}
          {!aiAvailable && submitted && (
            <p
              style={{
                marginTop: 16,
                color: "#6b6294",
                fontWeight: 700,
                fontSize: 12.5,
              }}
            >
              💡 Add an Anthropic API key for AI-picked exact matches with prices.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── bits ────────────────────────── */

const ghostBtn: React.CSSProperties = {
  background: "#1a1340",
  border: "2px solid rgba(139,92,255,.3)",
  padding: "9px 14px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 13.5,
  color: "#e8e2ff",
};

const selectStyle: React.CSSProperties = {
  background: "#1a1340",
  border: "2px solid rgba(139,92,255,.3)",
  color: "#e8e2ff",
  fontWeight: 700,
  fontSize: 13.5,
  padding: "10px 14px",
  borderRadius: 12,
  outline: "none",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "rgba(0,0,0,.25)",
        color: "#fff",
        fontSize: 11.5,
        fontWeight: 800,
        padding: "5px 11px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

function Chip({
  label,
  dot,
  active,
  onClick,
}: {
  label: string;
  dot: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 15px",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 13.5,
        border: `2px solid ${active ? dot : "rgba(139,92,255,.25)"}`,
        background: active ? hexA(dot, 0.16) : "#1a1340",
        color: active ? dot : "#b6acdf",
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: dot }} />
      {label}
    </button>
  );
}

function Heart({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill={filled ? "#ff5db1" : "none"}
      stroke={filled ? "none" : "#e4deff"}
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.9-10-9.2C.3 8.7 1.6 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.4 0 4.7 3.7 3 6.8C19.5 16.1 12 21 12 21z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8f84c9"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}

function Orb({
  top,
  left,
  right,
  size,
  color,
  dur,
  reverse,
  blur = 30,
}: {
  top: number | string;
  left?: number | string;
  right?: number | string;
  size: number;
  color: string;
  dur: string;
  reverse?: boolean;
  blur?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle,${color},transparent 70%)`,
        filter: `blur(${blur}px)`,
        animation: `floaty ${dur} ease-in-out infinite${reverse ? " reverse" : ""}`,
        pointerEvents: "none",
      }}
    />
  );
}

/** hex + alpha → rgba() string. */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
