"use client";

import { useState } from "react";
import type { Feature } from "@/lib/sprunki";

/** Lighten (positive pct) or darken (negative pct) a hex colour. */
function shade(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const f = (t: number) =>
    Math.max(0, Math.min(255, Math.round(p < 0 ? (t * (100 + p)) / 100 : t + ((255 - t) * p) / 100)));
  return (
    "#" +
    [f(r), f(g), f(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Stylised Sprunki figure — the fallback art from the design, drawn behind the
 * real character image so a card never renders empty if the wiki art fails.
 */
export function SprunkiFallback({
  color,
  face,
  feat,
}: {
  color: string;
  face: number;
  feat: Feature;
}) {
  const cc = shade(color, -32);
  const dk = "#1b1130";
  const wh = "#fff";

  return (
    <svg
      viewBox="0 0 100 124"
      width="100%"
      height="100%"
      style={{
        display: "block",
        overflow: "visible",
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,.35))",
      }}
    >
      <rect x={27} y={30} width={52} height={92} rx={26} fill={cc} />
      {feat === "horns" && (
        <>
          <path d="M35 26 L30 4 L46 22 Z" fill={cc} />
          <path d="M65 26 L70 4 L54 22 Z" fill={cc} />
        </>
      )}
      {feat === "antenna" && (
        <>
          <line x1={50} y1={20} x2={50} y2={5} stroke={cc} strokeWidth={5} strokeLinecap="round" />
          <circle cx={50} cy={5} r={6} fill={color} />
        </>
      )}
      <rect x={24} y={20} width={52} height={96} rx={26} fill={color} />
      <ellipse cx={50} cy={84} rx={16} ry={22} fill={wh} opacity={0.13} />

      {face === 0 && (
        <>
          <circle cx={39} cy={56} r={9} fill={wh} />
          <circle cx={61} cy={56} r={9} fill={wh} />
          <circle cx={40} cy={58} r={4.2} fill={dk} />
          <circle cx={62} cy={58} r={4.2} fill={dk} />
          <path d="M38 76 Q50 91 62 76" stroke={dk} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        </>
      )}
      {face === 1 && (
        <>
          <ellipse cx={39} cy={54} rx={7} ry={10} fill={wh} />
          <ellipse cx={61} cy={54} rx={7} ry={10} fill={wh} />
          <circle cx={39} cy={56} r={4} fill={dk} />
          <circle cx={61} cy={56} r={4} fill={dk} />
          <ellipse cx={50} cy={82} rx={9} ry={11} fill={dk} />
          <ellipse cx={50} cy={88} rx={6} ry={5} fill="#ff6f9c" />
        </>
      )}
      {face === 2 && (
        <>
          <circle cx={39} cy={55} r={8} fill={wh} />
          <circle cx={61} cy={55} r={8} fill={wh} />
          <circle cx={40} cy={56} r={4} fill={dk} />
          <circle cx={62} cy={56} r={4} fill={dk} />
          <path d="M35 74 h30 v3 a15 15 0 0 1 -30 0 Z" fill={dk} />
          <rect x={35} y={74} width={30} height={5} fill={wh} />
        </>
      )}
      {face === 3 && (
        <>
          <circle cx={39} cy={55} r={8} fill={wh} />
          <circle cx={61} cy={55} r={8} fill={wh} />
          <circle cx={40} cy={52} r={4.2} fill={dk} />
          <circle cx={62} cy={52} r={4.2} fill={dk} />
          <path d="M41 80 q9 6 18 0" stroke={dk} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
      {face >= 4 && (
        <>
          <circle cx={40} cy={55} r={7} fill={wh} />
          <circle cx={60} cy={55} r={7} fill={wh} />
          <circle cx={40} cy={55} r={3.4} fill={dk} />
          <circle cx={60} cy={55} r={3.4} fill={dk} />
          <circle cx={50} cy={80} r={5.5} fill={dk} />
        </>
      )}

      {feat === "cap" && (
        <>
          <path d="M24 34 Q26 12 50 12 Q74 12 76 34 Z" fill={shade(color, -18)} />
          <rect x={22} y={32} width={56} height={7} rx={3.5} fill={shade(color, -30)} />
          <circle cx={50} cy={10} r={5} fill={wh} opacity={0.85} />
        </>
      )}
      {feat === "head" && (
        <>
          <path d="M26 46 Q26 14 50 14 Q74 14 74 46" stroke="#241a44" strokeWidth={7} fill="none" strokeLinecap="round" />
          <rect x={18} y={44} width={13} height={22} rx={6} fill="#241a44" />
          <rect x={69} y={44} width={13} height={22} rx={6} fill="#241a44" />
          <rect x={21} y={50} width={7} height={10} rx={3} fill={color} />
          <rect x={72} y={50} width={7} height={10} rx={3} fill={color} />
        </>
      )}
      {feat === "none" && <path d="M44 21 Q50 6 56 21 Z" fill={cc} />}
    </svg>
  );
}

/**
 * Real character art (Fandom wiki SVG) layered over the stylised fallback —
 * exactly the `makeArt` pattern from the design. If the image 404s we hide it
 * and the fallback shows through.
 */
export default function SprunkiArt({
  src,
  color,
  face,
  feat,
  horror = false,
}: {
  src: string;
  color: string;
  face: number;
  feat: Feature;
  horror?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const displayColor = horror ? shade(color, -30) : color;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <SprunkiFallback color={displayColor} face={face} feat={feat} />
      </div>
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            position: "relative",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            objectPosition: "bottom center",
            display: "block",
            filter: horror
              ? "drop-shadow(0 10px 16px rgba(0,0,0,.42)) saturate(.55) brightness(.72) contrast(1.15)"
              : "drop-shadow(0 10px 16px rgba(0,0,0,.42))",
          }}
        />
      )}
    </div>
  );
}
