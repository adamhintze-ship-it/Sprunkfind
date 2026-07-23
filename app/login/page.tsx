import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";

// Auth-dependent: render per request, never statically prerender.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // If Supabase is configured and the user is already signed in, skip login.
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <p className="text-5xl">🧸🔎</p>
        <p className="mt-2 max-w-xs text-sm text-white/60">
          The AI scout that hunts down Sprunki plushies from every phase — and
          keeps track of your collection.
        </p>
      </div>
      <AuthForm />
    </main>
  );
}
