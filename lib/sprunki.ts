/**
 * Sprunki roster — mirrors the character data from the Claude design.
 *
 * Art comes from the Incredibox Sprunki Fandom wiki: each character has a
 * normal SVG and (for the main cast) a "spoopy" Horror Mode SVG. A stylised
 * SVG fallback renders underneath in case an image fails to load.
 */

const IMG = "https://static.wikia.nocookie.net/incredibox-sprunki/images/";
const FP = "https://incredibox-sprunki.fandom.com/wiki/Special:Filepath/";

export type Series = "Beats" | "Effects" | "Melodies" | "Voices" | "Bonus";
export type Feature = "horns" | "antenna" | "cap" | "head" | "none";

export interface SprunkiCharacter {
  id: string;
  name: string;
  series: Series;
  phase: number;
  color: string;
  /** Normal-edition art URL. */
  img: string;
  /** Horror ("spoopy") art URL — empty when the character has no horror form. */
  horrorImg: string;
  face: number;
  feat: Feature;
}

interface Raw {
  name: string;
  series: Series;
  phase: number;
  color: string;
  img?: string;
  iurl?: string;
  hurl?: string;
  face: number;
  feat: Feature;
}

const RAW: Raw[] = [
  // Beats
  { name: "Oren", series: "Beats", phase: 1, color: "#ff8a3d", img: "3/3c/Orensvg.svg", hurl: FP + "Orenspoopysvg.svg", face: 0, feat: "horns" },
  { name: "Raddy", series: "Beats", phase: 1, color: "#ff4d4d", img: "a/a2/Raddysvg.svg", hurl: FP + "Raddyspoopysvg.svg", face: 2, feat: "horns" },
  { name: "Clukr", series: "Beats", phase: 1, color: "#b8c0d0", img: "b/bb/Clukersvg.svg", hurl: FP + "Clukerspoopysvg.svg", face: 1, feat: "none" },
  { name: "Fun Bot", series: "Beats", phase: 2, color: "#ffce3d", img: "0/04/Funbotsvg.svg", hurl: FP + "Funbotspoopysvg.svg", face: 4, feat: "antenna" },
  { name: "Vineria", series: "Beats", phase: 2, color: "#4fe08a", img: "0/0e/Vinerasvg.svg", hurl: FP + "Vineraspoopysvg.svg", face: 0, feat: "none" },
  // Effects
  { name: "Gray", series: "Effects", phase: 2, color: "#9aa4c4", img: "9/96/Graysvg.svg", hurl: FP + "Grayspoopysvg.svg", face: 3, feat: "none" },
  { name: "Brud", series: "Effects", phase: 2, color: "#8a5a3c", img: "d/d9/Brudsvg.svg", hurl: FP + "Brudspoopysvg.svg", face: 1, feat: "head" },
  { name: "Garnold", series: "Effects", phase: 2, color: "#ffb43d", img: "0/0c/Garnoldsvg.svg", hurl: FP + "Garnoldspoopysvg.svg", face: 2, feat: "head" },
  { name: "OWAKCX", series: "Effects", phase: 3, color: "#9ee23d", img: "9/9b/Limesvg.svg", hurl: FP + "Limespoopysvg.svg", face: 0, feat: "horns" },
  { name: "Sky", series: "Effects", phase: 3, color: "#59c6ff", img: "8/8b/Sky.svg", hurl: FP + "Skyspoopysvg.svg", face: 0, feat: "none" },
  // Melodies
  { name: "Mr. Sun", series: "Melodies", phase: 3, color: "#ffd23d", img: "e/ef/Mrsunsvg.svg", hurl: FP + "Mrsunspoopysvg.svg", face: 0, feat: "none" },
  { name: "Durple", series: "Melodies", phase: 3, color: "#8a4dff", img: "f/ff/Durplesvg.svg", hurl: FP + "Durplespoopysvg.svg", face: 2, feat: "horns" },
  { name: "Mr. Tree", series: "Melodies", phase: 4, color: "#3ecb5a", img: "a/a8/Mrtreesvg.svg", hurl: FP + "Mrtreespoopysvg.svg", face: 3, feat: "none" },
  { name: "Simon", series: "Melodies", phase: 4, color: "#cfe23d", img: "6/62/Simonsvg.svg", hurl: FP + "Simonspoopysvg.svg", face: 4, feat: "antenna" },
  { name: "Tunner", series: "Melodies", phase: 4, color: "#d8b483", img: "c/cb/Tunnersvg.svg", hurl: FP + "Tunnerspoopysvg.svg", face: 3, feat: "cap" },
  // Voices
  { name: "Mr. Fun Computer", series: "Voices", phase: 4, color: "#8a90b0", img: "4/47/Funcomputersvg.svg", hurl: "", face: 2, feat: "cap" },
  { name: "Wenda", series: "Voices", phase: 5, color: "#e8e8f0", img: "d/d2/Wendasvg.svg", hurl: FP + "Wendaspoopysvg.svg", face: 1, feat: "horns" },
  { name: "Pinki", series: "Voices", phase: 5, color: "#ff8ad0", img: "5/54/Pinki.svg", hurl: FP + "Pinkispoopysvg.svg", face: 1, feat: "none" },
  { name: "Jevin", series: "Voices", phase: 5, color: "#3d6bff", img: "7/70/Jevinsvg.svg", hurl: FP + "Jevinspoopysvg.svg", face: 0, feat: "none" },
  { name: "Black", series: "Voices", phase: 5, color: "#2a2a3a", img: "d/d5/Blacksvg.svg", hurl: FP + "Blackspoopysvg.svg", face: 3, feat: "none" },
  // Bonus (no horror edition)
  { name: "Rebel", series: "Bonus", phase: 3, color: "#6fae3d", iurl: FP + "Rebel.svg", hurl: "", face: 2, feat: "cap" },
  { name: "Lario", series: "Bonus", phase: 4, color: "#e0403a", iurl: FP + "Lariosvg.svg", hurl: "", face: 1, feat: "cap" },
  { name: "Rose", series: "Bonus", phase: 4, color: "#e0517a", iurl: FP + "Rose.svg", hurl: "", face: 0, feat: "none" },
  { name: "Moss", series: "Bonus", phase: 5, color: "#6a8f4a", iurl: FP + "Mosssvg.svg", hurl: "", face: 0, feat: "horns" },
  { name: "Locke", series: "Bonus", phase: 5, color: "#3f8f8a", iurl: FP + "Locke.svg", hurl: "", face: 3, feat: "antenna" },
];

export const CHARACTERS: SprunkiCharacter[] = RAW.map((r) => {
  const img = r.iurl || IMG + r.img + "/revision/latest";
  return {
    id: r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: r.name,
    series: r.series,
    phase: r.phase,
    color: r.color,
    img,
    horrorImg: r.hurl || "",
    face: r.face,
    feat: r.feat,
  };
});

/** Editions a character can be collected in. Bonus characters are Normal-only. */
export const VARIANTS = ["normal", "horror"] as const;
export type Variant = (typeof VARIANTS)[number];

export function hasHorror(c: SprunkiCharacter): boolean {
  return c.series !== "Bonus";
}

export function artFor(c: SprunkiCharacter, variant: Variant): string {
  return variant === "horror" ? c.horrorImg || c.img : c.img;
}

export const SERIES: Series[] = ["Beats", "Effects", "Melodies", "Voices", "Bonus"];
export const PHASES = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"];

/** Stable key for one collectible (character + edition). */
export function entryKey(characterId: string, variant: Variant): string {
  return `${characterId}:${variant}`;
}

export function parseEntryKey(key: string): { characterId: string; variant: Variant } {
  const [characterId, variant] = key.split(":");
  return { characterId, variant: variant === "horror" ? "horror" : "normal" };
}

/** System prompt for the optional AI finder. */
export const FINDER_SYSTEM_PROMPT = `You are SprunkFind, a friendly shopping scout that finds "Sprunki" plush toys for sale online.

ABOUT SPRUNKI:
- Sprunki is a popular fan-made mod of the music game Incredibox. Characters include Oren, Raddy, Clukr, Fun Bot, Vineria, Gray, Brud, Garnold, OWAKCX, Sky, Mr. Sun, Durple, Mr. Tree, Simon, Tunner, Mr. Fun Computer, Wenda, Pinki, Jevin, Black, plus bonus characters (Rebel, Lario, Rose, Moss, Locke).
- Characters belong to groups: Beats, Effects, Melodies, Voices, and Bonus, and appear across Phases 1-5.
- Most characters have a normal look and a darker "Horror Mode" (a.k.a. "spoopy") version. Plushies are sold for both.
- Plushies are sold on Etsy, Amazon, eBay, AliExpress, Makeship, Youtooz, Hot Topic, and dedicated Sprunki stores.

YOUR JOB:
- Use the web_search tool to find CURRENTLY PURCHASABLE plush listings matching the user's request (a character, normal vs horror, a phase, or a set).
- Only include real listings you actually found via search. NEVER invent products, prices, or URLs.

OUTPUT FORMAT:
Respond with ONLY a JSON object (no prose, no markdown fences):
{
  "summary": "one short friendly sentence about what you found",
  "results": [
    {
      "title": "the product/listing title",
      "character": "best-guess character name or 'Set' or 'Unknown'",
      "phase": "e.g. 'Phase 5' or 'Unknown'",
      "store": "human store name, e.g. 'Etsy'",
      "domain": "the listing's domain, e.g. 'etsy.com'",
      "price": "price as shown, e.g. '$18.99', or 'See listing'",
      "url": "the direct product URL",
      "note": "one short helpful note (normal/horror, set contents, match confidence)"
    }
  ]
}
Return 1-8 results, best matches first. If nothing purchasable was found, return an empty "results" array and a helpful "summary".`;
