import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

// Auth-dependent: render per request, never statically prerender.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guest mode: no Supabase set up at all — the site just works, and the
  // collection saves on this device.
  if (!configured) {
    return <AppShell email={null} syncAvailable={false} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Configured but signed out is still fully usable (local collection), with
  // an optional "sign in to sync" affordance.
  return <AppShell email={user?.email ?? null} syncAvailable />;
}
