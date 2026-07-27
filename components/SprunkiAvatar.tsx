"use client";

/**
 * Stylised Sprunki-style character figure. Each roster character gets a colour
 * and simple face traits so the grid reads as a cast of distinct characters,
 * in the blocky/bean silhouette the design uses. Horror edition desaturates,
 * darkens and adds an unsettling eye treatment.
 */
export default function SprunkiAvatar({
  color,
  accent,
  horror = false,
  face = 0,
}: {
  color: string;
  accent: string;
  horror?: boolean;
  face?: number;
}) {
  const body = horror ? shade(color, -0.45) : color;
  const hair = horror ? shade(accent, -0.4) : accent;
  const eyeFill = horror ? "#ff3b3b" : "#0b0722";

  return (
    <svg
      viewBox="0 0 120 160"
      width="100%"
      height="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* hair / crown */}
      <path
        d={
          face % 3 === 0
            ? "M26 44 C26 12, 94 12, 94 44 L94 52 L26 52 Z"
            : face % 3 === 1
              ? "M24 46 C30 14, 90 14, 96 46 L96 50 L24 50 Z"
              : "M28 46 C28 18, 92 18, 92 46 L92 52 L28 52 Z"
        }
        fill={hair}
      />
      {/* body */}
      <rect x="26" y="46" width="68" height="86" rx="26" fill={body} />
      {/* feet */}
      <rect x="38" y="128" width="18" height="14" rx="7" fill={shade(body, -0.25)} />
      <rect x="64" y="128" width="18" height="14" rx="7" fill={shade(body, -0.25)} />
      {/* arms */}
      <rect x="14" y="66" width="14" height="42" rx="7" fill={shade(body, -0.12)} />
      <rect x="92" y="66" width="14" height="42" rx="7" fill={shade(body, -0.12)} />

      {/* eyes */}
      {horror ? (
        <>
          <ellipse cx="48" cy="76" rx="9" ry="10" fill="#0b0510" />
          <ellipse cx="72" cy="76" rx="9" ry="10" fill="#0b0510" />
          <circle cx="48" cy="77" r="3.4" fill={eyeFill} />
          <circle cx="72" cy="77" r="3.4" fill={eyeFill} />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="76" rx="9.5" ry="10.5" fill="#fff" />
          <ellipse cx="72" cy="76" rx="9.5" ry="10.5" fill="#fff" />
          <circle cx={face % 2 ? 49.5 : 47} cy="77" r="4.2" fill={eyeFill} />
          <circle cx={face % 2 ? 73.5 : 71} cy="77" r="4.2" fill={eyeFill} />
        </>
      )}

      {/* mouth */}
      {horror ? (
        <path
          d="M46 101 L52 96 L58 101 L64 96 L70 101 L76 96"
          stroke="#ff3b3b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : face % 2 === 0 ? (
        <path
          d="M46 98 Q60 110 74 98"
          stroke="#0b0722"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <ellipse cx="60" cy="101" rx="9" ry="7" fill="#0b0722" />
      )}
    </svg>
  );
}

/** Lighten (positive) or darken (negative) a hex colour. */
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const f = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  r = f(r);
  g = f(g);
  b = f(b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
