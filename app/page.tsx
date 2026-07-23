import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

// Auth-dependent: render per request, never statically prerender.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!configured) {
    // First-boot: Supabase env not set yet. Show setup guidance instead of
    // crashing (the Supabase client can't initialize without its keys).
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-5xl">🧸🔧</p>
        <h1 className="text-2xl font-extrabold text-sprunki-accent">
          SprunkFind needs a quick setup
        </h1>
        <p className="text-sm text-white/60">
          Set <code className="text-sprunki-accent2">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="text-sprunki-accent2">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
          <code className="text-sprunki-accent2">ANTHROPIC_API_KEY</code> in your
          environment (see <code>.env.example</code> and the README).
        </p>
        <a
          href="/setup"
          className="rounded-full bg-sprunki-accent px-5 py-2.5 font-bold text-white transition hover:brightness-110"
        >
          Open the setup checklist →
        </a>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <AppShell email={user.email ?? "your account"} />;
}
