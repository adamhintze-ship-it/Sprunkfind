import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { FINDER_SYSTEM_PROMPT } from "@/lib/sprunki";

export const runtime = "nodejs";
// Web searches can take a little while; give the route room.
export const maxDuration = 60;

const MODEL = process.env.FINDER_MODEL || "claude-sonnet-5";

// The dynamic-filtering web_search tool (20260209) isn't supported on Haiku;
// fall back to the basic variant so any documented model works.
type FinderTool = NonNullable<Anthropic.MessageCreateParams["tools"]>[number];
const WEB_SEARCH_TOOL: FinderTool = /haiku/i.test(MODEL)
  ? { type: "web_search_20250305", name: "web_search", max_uses: 5 }
  : { type: "web_search_20260209", name: "web_search", max_uses: 5 };

interface FinderResult {
  title: string;
  character: string;
  phase: string;
  store: string;
  domain: string;
  price: string;
  url: string;
  note: string;
}

export async function POST(request: Request) {
  // 1. Require an authenticated user (skip the check only if Supabase is
  //    not configured yet, so the app is still testable on first boot).
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Please sign in first." }, { status: 401 });
    }
  }

  // 2. Require an API key — return a friendly message, not a 500.
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "The finder isn't set up yet — ANTHROPIC_API_KEY is missing. Add it to your environment.",
      },
      { status: 503 },
    );
  }

  let query = "";
  try {
    const body = await request.json();
    query = String(body?.query ?? "").trim();
  } catch {
    /* ignore */
  }
  if (!query) {
    return Response.json({ error: "Type what you're looking for." }, { status: 400 });
  }

  const client = new Anthropic();

  try {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: `Find Sprunki plush toys for sale: ${query}` },
    ];

    let final: Anthropic.Message | null = null;

    // Server-side web search runs inside Anthropic's infra. If the tool loop
    // hits its iteration cap the response comes back as stop_reason "pause_turn";
    // re-send to continue. Cap continuations to avoid runaway loops.
    for (let i = 0; i < 4; i++) {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        system: FINDER_SYSTEM_PROMPT,
        tools: [WEB_SEARCH_TOOL],
        messages,
      });
      final = await stream.finalMessage();

      if (final.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: final.content });
        continue;
      }
      break;
    }

    if (!final) {
      return Response.json({ error: "No response from the finder." }, { status: 502 });
    }

    const text = final.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    const parsed = extractJson(text);
    if (!parsed) {
      return Response.json({
        summary:
          "I searched but couldn't format the results. Try rephrasing (e.g. \"Wenda Phase 5 plush\").",
        results: [] as FinderResult[],
      });
    }

    const results = (Array.isArray(parsed.results) ? parsed.results : [])
      .filter((r: unknown): r is Record<string, unknown> => !!r && typeof r === "object")
      .map(normalizeResult)
      .filter((r): r is FinderResult => r.url.length > 0);

    return Response.json({
      summary:
        typeof parsed.summary === "string" && parsed.summary
          ? parsed.summary
          : results.length
            ? `Found ${results.length} listing${results.length === 1 ? "" : "s"}.`
            : "No matching plushies found — try a different character or phase.",
      results,
    });
  } catch (err) {
    console.error("finder error", err);
    const message =
      err instanceof Anthropic.APIError
        ? `The finder had a problem (${err.status ?? "error"}). Please try again.`
        : "Something went wrong searching. Please try again.";
    return Response.json({ error: message }, { status: 502 });
  }
}

/** Pull the first JSON object out of the model's text, tolerating stray fences. */
function extractJson(text: string): { summary?: unknown; results?: unknown } | null {
  const cleaned = text.replace(/```json\s*|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeResult(r: Record<string, unknown>): FinderResult {
  const url = str(r.url);
  let domain = str(r.domain);
  if (!domain && url) {
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      /* leave blank */
    }
  }
  return {
    title: str(r.title) || "Sprunki plush",
    character: str(r.character) || "Unknown",
    phase: str(r.phase) || "Unknown",
    store: str(r.store) || domain || "Store",
    domain,
    price: str(r.price) || "See listing",
    url,
    note: str(r.note),
  };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
