"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";

export default function AuthForm() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else
        setMessage(
          "Account created! Check your email to confirm, then sign in.",
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else window.location.assign("/");
    }
    setBusy(false);
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success the browser is redirected to Google.
  }

  return (
    <div className="w-full max-w-sm rounded-3xl bg-sprunki-panel/80 p-7 shadow-2xl ring-1 ring-white/10 backdrop-blur">
      <h1 className="text-center text-3xl font-extrabold text-sprunki-accent">
        SprunkFind
      </h1>
      <p className="mb-6 mt-1 text-center text-sm text-white/60">
        {mode === "signin"
          ? "Welcome back! Sign in to your collection."
          : "Create an account to start collecting."}
      </p>

      {GOOGLE_ENABLED && (
        <>
          <button
            onClick={handleGoogle}
            disabled={busy}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 font-semibold text-gray-800 transition hover:bg-gray-100 disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-white/40">
            <span className="h-px flex-1 bg-white/15" />
            or use email
            <span className="h-px flex-1 bg-white/15" />
          </div>
        </>
      )}

      <form onSubmit={handleEmail} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-black/30 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-sprunki-accent2"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-black/30 px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-sprunki-accent2"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-sprunki-accent px-4 py-2.5 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {busy
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      )}

      <p className="mt-5 text-center text-sm text-white/60">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="font-semibold text-sprunki-accent2 hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
