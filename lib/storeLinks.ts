/**
 * Client-side store-search links — the zero-setup finder. No API key needed:
 * we just build a search URL into each major store for the user's query. One
 * tap opens that store's results for the plush they're after.
 */

export interface StoreLink {
  name: string;
  emoji: string;
  domain: string;
  url: string;
}

/** Ensure the search has useful context ("sprunki" + "plush") without duplicating. */
function enrich(query: string): string {
  let q = query.trim();
  if (!/sprunki/i.test(q)) q += " sprunki";
  if (!/plush/i.test(q)) q += " plush";
  return q;
}

export function storeSearchLinks(query: string): StoreLink[] {
  const q = enrich(query);
  const e = encodeURIComponent(q);
  return [
    {
      name: "Etsy",
      emoji: "🧵",
      domain: "etsy.com",
      url: `https://www.etsy.com/search?q=${e}`,
    },
    {
      name: "Amazon",
      emoji: "📦",
      domain: "amazon.com",
      url: `https://www.amazon.com/s?k=${e}`,
    },
    {
      name: "eBay",
      emoji: "🔨",
      domain: "ebay.com",
      url: `https://www.ebay.com/sch/i.html?_nkw=${e}`,
    },
    {
      name: "AliExpress",
      emoji: "🛒",
      domain: "aliexpress.com",
      url: `https://www.aliexpress.com/wholesale?SearchText=${e}`,
    },
    {
      name: "Google Shopping",
      emoji: "🔍",
      domain: "google.com",
      url: `https://www.google.com/search?tbm=shop&q=${e}`,
    },
  ];
}
