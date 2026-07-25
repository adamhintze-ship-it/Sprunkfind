/**
 * Static domain data for Sprunki (the Incredibox fan-mod universe).
 *
 * The main cast is tracked in two forms — the normal ("Normal Mode") look and
 * the darker "Horror Mode" version — and each tracked item carries a phase
 * (Phase 1–5). This powers the collection grid and seeds the finder prompt.
 *
 * Sprunki is fan-made and huge; new characters/phases keep appearing. This is
 * the widely-merchandised core cast. The free-text search box covers anything
 * not listed here.
 */

export interface SprunkiCharacter {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
}

export const CHARACTERS: SprunkiCharacter[] = [
  { id: "sprunki", name: "Sprunki (Orange)", emoji: "🟠", blurb: "The classic orange-haired lead." },
  { id: "wenda", name: "Wenda", emoji: "💗", blurb: "Kind-hearted dreamer (vocals)." },
  { id: "simon", name: "Simon", emoji: "🧠", blurb: "Calm, clever thinker (melody)." },
  { id: "oren", name: "Oren", emoji: "🟦", blurb: "Brave and bold buddy (beats)." },
  { id: "brud", name: "Brud", emoji: "🥁", blurb: "The lovable goofball." },
  { id: "pinki", name: "Pinki", emoji: "🌸", blurb: "Bubbly burst of color (vocals)." },
  { id: "gray", name: "Gray", emoji: "🩶", blurb: "Mysterious and wise (effects)." },
  { id: "black", name: "Black", emoji: "⬛", blurb: "Cool and quiet (vocals)." },
  { id: "jevin", name: "Jevin", emoji: "🎧", blurb: "Tech-savvy trickster (vocals)." },
  { id: "sky", name: "Sky", emoji: "☁️", blurb: "Calm, cloud-chasing pal (effects)." },
  { id: "mr-tree", name: "Mr. Tree", emoji: "🌳", blurb: "Steady, rooted friend (melody)." },
  { id: "mr-sun", name: "Mr. Sun", emoji: "🌞", blurb: "Warm, beaming melody-maker." },
  { id: "vineria", name: "Vineria", emoji: "🍃", blurb: "Leafy beat-keeper (beats)." },
  { id: "durple", name: "Durple", emoji: "🟣", blurb: "Mellow purple melody one." },
  { id: "raddy", name: "Raddy", emoji: "📻", blurb: "Retro radio-head (beats)." },
  { id: "clukr", name: "Clukr", emoji: "🐔", blurb: "Clucky beatmaker (beats)." },
  { id: "garnold", name: "Garnold", emoji: "🎺", blurb: "Clukr's brassy collaborator." },
  { id: "fun-bot", name: "Fun Bot", emoji: "🤖", blurb: "Electronic party bot (beats)." },
  { id: "tunner", name: "Tunner", emoji: "🎶", blurb: "Melodic tune-spinner (melody)." },
  { id: "mr-fun-computer", name: "Mr. Fun Computer", emoji: "🖥️", blurb: "Glitchy vocal ringleader." },
];

/** Each character can be collected in a Normal and a Horror form. */
export const VARIANTS = ["normal", "horror"] as const;
export type Variant = (typeof VARIANTS)[number];

export const VARIANT_META: Record<Variant, { label: string; emoji: string }> = {
  normal: { label: "Normal", emoji: "😀" },
  horror: { label: "Horror", emoji: "💀" },
};

export const PHASES = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"];

/** Stable key for one collectible (character + variant) as stored in the DB. */
export function entryKey(characterId: string, variant: Variant): string {
  return `${characterId}:${variant}`;
}

export function parseEntryKey(key: string): { characterId: string; variant: Variant } {
  const [characterId, variant] = key.split(":");
  return {
    characterId,
    variant: variant === "horror" ? "horror" : "normal",
  };
}

/**
 * System prompt for the AI finder. Gives Claude the domain context and pins the
 * output to a strict JSON shape we can parse into result cards.
 */
export const FINDER_SYSTEM_PROMPT = `You are SprunkFind, a friendly shopping scout that finds "Sprunki" plush toys for sale online.

ABOUT SPRUNKI:
- Sprunki is a popular fan-made mod of the music game Incredibox. Its colorful characters (Sprunki/Orange, Wenda, Simon, Oren, Brud, Pinki, Gray, Black, Jevin, Sky, Mr. Tree, Mr. Sun, Vineria, Durple, Raddy, Clukr, Garnold, Fun Bot, Tunner, Mr. Fun Computer, and more) have been made into collectible plush toys.
- Characters come in a normal ("Normal Mode") look and a darker "Horror Mode" version. Plushies are sold for both.
- Characters are associated with "phases" (Phase 1 through Phase 5+), which are different community versions of the mod. Some plushies are phase-specific or sold as sets.
- Plushies are sold on Amazon, Etsy, eBay, AliExpress, and dedicated stores such as sprunkiplushtoys.com and sprunkiplushies.net.

YOUR JOB:
- Use the web_search tool to find CURRENTLY PURCHASABLE plush listings matching the user's request (a specific character, normal vs horror, a phase, or a set).
- Prefer listings that clearly match the requested character, variant (normal/horror), and/or phase. Close alternatives are fine, but say so.
- Only include real listings you actually found via search. NEVER invent products, prices, or URLs.

OUTPUT FORMAT:
When done searching, respond with ONLY a JSON object (no prose, no markdown fences) of this exact shape:
{
  "summary": "one short friendly sentence about what you found",
  "results": [
    {
      "title": "the product/listing title",
      "character": "best-guess character name or 'Set' or 'Unknown'",
      "phase": "e.g. 'Phase 5' or 'Unknown'",
      "store": "human store name, e.g. 'Etsy' or 'Amazon'",
      "domain": "the listing's domain, e.g. 'etsy.com'",
      "price": "price as shown, e.g. '$18.99', or 'See listing' if unknown",
      "url": "the direct product URL",
      "note": "one short helpful note (normal/horror, condition, set contents, match confidence, shipping, etc.)"
    }
  ]
}
Return between 1 and 8 results, best matches first. If you truly found nothing purchasable, return an empty "results" array and a helpful "summary" suggesting how to rephrase.`;
