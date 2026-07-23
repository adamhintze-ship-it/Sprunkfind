/**
 * Static domain data for Sprunki (the Incredibox fan-mod universe).
 *
 * This roster powers the collection grid and the finder's quick-pick chips,
 * and seeds the AI finder's system prompt so Claude uses correct character
 * and phase terminology when searching for plushies.
 *
 * Note: the Sprunki community is large and fan-made; new characters and phases
 * appear over time. This list covers the widely-merchandised core cast. The
 * free-text search box lets kids look for anything not listed here.
 */

export interface SprunkiCharacter {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
}

export const CHARACTERS: SprunkiCharacter[] = [
  { id: "orange", name: "Orange (Sprunki)", emoji: "🟠", blurb: "The classic orange-haired lead." },
  { id: "wenda", name: "Wenda", emoji: "💗", blurb: "The kind-hearted dreamer." },
  { id: "simon", name: "Simon", emoji: "🧠", blurb: "The calm and clever thinker." },
  { id: "oren", name: "Oren", emoji: "🟦", blurb: "The brave and bold buddy." },
  { id: "brud", name: "Brud", emoji: "🥁", blurb: "The lovable goofball." },
  { id: "pinki", name: "Pinki", emoji: "🌸", blurb: "The bubbly burst of color." },
  { id: "gray", name: "Gray", emoji: "🩶", blurb: "Mysterious and wise." },
  { id: "black", name: "Black", emoji: "⬛", blurb: "The cool and quiet one." },
  { id: "jevin", name: "Jevin", emoji: "🎧", blurb: "The tech-savvy trickster." },
  { id: "sky", name: "Sky", emoji: "☁️", blurb: "The calm, cloud-chasing pal." },
  { id: "mr-tree", name: "Mr. Tree", emoji: "🌳", blurb: "The steady, rooted friend." },
  { id: "vineria", name: "Vineria", emoji: "🍃", blurb: "The leafy songstress." },
  { id: "durple", name: "Durple", emoji: "🟣", blurb: "The mellow purple one." },
  { id: "raddy", name: "Raddy", emoji: "📻", blurb: "The retro radio head." },
  { id: "clukr", name: "Clukr", emoji: "🐔", blurb: "The clucky beatmaker." },
  { id: "fun-bot", name: "Fun Bot", emoji: "🤖", blurb: "The electronic party bot." },
];

export const PHASES: string[] = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Phase 5",
  "Any / Not sure",
];

/**
 * System prompt for the AI finder. Gives Claude the domain context it needs and
 * pins the output to a strict JSON shape we can parse into result cards.
 */
export const FINDER_SYSTEM_PROMPT = `You are SprunkFind, a friendly shopping scout that finds "Sprunki" plush toys for sale online.

ABOUT SPRUNKI:
- Sprunki is a popular fan-made mod of the music game Incredibox. Its colorful characters (Orange/Sprunki, Wenda, Simon, Oren, Brud, Pinki, Gray, Black, Jevin, Sky, Mr. Tree, and more) have been turned into collectible plush toys.
- Characters are associated with "phases" (Phase 1 through Phase 5+), which are different community versions of the mod. Some plushies are sold as phase-specific sets or single characters.
- Plushies are sold on Amazon, Etsy, eBay, AliExpress, and dedicated stores such as sprunkiplushtoys.com and sprunkiplushies.net.

YOUR JOB:
- Use the web_search tool to find CURRENTLY PURCHASABLE plush listings that match the user's request (a specific character, a phase, or a set).
- Prefer listings that clearly match the requested character and/or phase. It's fine to include close alternatives, but say so.
- Only include real listings you actually found via search. NEVER invent products, prices, or URLs.

OUTPUT FORMAT:
When you are done searching, respond with ONLY a JSON object (no prose, no markdown fences) of this exact shape:
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
      "note": "one short helpful note (condition, set contents, match confidence, shipping, etc.)"
    }
  ]
}
Return between 1 and 8 results, best matches first. If you truly found nothing purchasable, return an empty "results" array and a helpful "summary" suggesting how to rephrase.`;
