import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Setup / health check consumed by the /setup page. Reports which pieces of
 * configuration are in place so a first-time deployer knows exactly what's
 * left to do. Returns booleans only — never any secret values.
 */
export async function GET() {
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const google = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

  let database: "ok" | "missing" | "unknown" = "unknown";
  if (supabaseConfigured) {
    try {
      const supabase = await createClient();
      // A table that exists but is empty (RLS, no session) returns [] with no
      // error. A missing table returns a "relation does not exist" error.
      const { error } = await supabase
        .from("collections")
        .select("character_id")
        .limit(1);
      if (!error) database = "ok";
      else if (
        error.code === "42P01" ||
        /does not exist|could not find the table/i.test(error.message)
      ) {
        database = "missing";
      } else {
        database = "unknown";
      }
    } catch {
      database = "unknown";
    }
  }

  const ready = anthropic && supabaseConfigured && database === "ok";

  return Response.json({
    ready,
    checks: { anthropic, supabase: supabaseConfigured, database, google },
    model: process.env.FINDER_MODEL || "claude-sonnet-5",
  });
}
