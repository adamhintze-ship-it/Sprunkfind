# SprunkFind 🧸🔎

A website for tracking **Sprunki** plush toys (the *Incredibox – Sprunki* characters: Oren, Wenda, Simon, Clukr, Durple, and the rest) and hunting down the ones you're missing.

- **Collection** — every character in **Normal** and **Horror** editions, across Phases 1–5, marked **owned** or **wanted**. Saved automatically, no login needed.
- **Finder** — type any plush and get one-tap searches into Etsy, Amazon, eBay, AliExpress and Google Shopping. **No API key required.**

**Works with zero setup.** Sign-in (cross-device sync) and Claude-powered AI listings are optional extras you can switch on later.

Built with **Next.js (App Router)** and **Tailwind CSS**; optional **Supabase** for accounts and the **Anthropic API** for AI search. Deploys to **Vercel**.

---

## 🚀 One-click deploy (no setup, no accounts, no keys)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadamhintze-ship-it%2FSprunkfind&project-name=sprunkfind&repository-name=sprunkfind)

Tap the button, sign in to Vercel with GitHub, and hit **Deploy**. That's it —
there is **nothing to configure**. You get a public link like
`https://sprunkfind.vercel.app` you can send to anyone.

Out of the box you get the full character grid (Normal + Horror editions),
collection tracking saved on the device, and one-tap store searches on Etsy,
Amazon, eBay, AliExpress and Google Shopping.

### Optional extras (add later, only if you want them)

Both are added in Vercel under **Settings → Environment Variables**, then
**Redeploy**. Neither is needed for the app to work.

| Want | Add | Gets you |
| --- | --- | --- |
| AI-picked listings with prices | `ANTHROPIC_API_KEY` | Claude searches the web and returns exact matching plushies |
| Collection synced across devices | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sign-in, and the collection follows you phone → tablet → computer (also run `supabase/schema.sql`) |

Visit `/setup` on your deployed site any time for a live checklist of what's on.

---

## How it works

```
Browser ──login──▶ Supabase Auth (email/password + Google)
Browser ──POST /api/find──▶ Next.js server ──▶ Claude (web_search tool) ──▶ live web
Browser ──collection──▶ Supabase Postgres (Row-Level Security: each user sees only their rows)
```

The `ANTHROPIC_API_KEY` lives only on the server (`app/api/find/route.ts`) and is never shipped to the browser.

---

## Running it locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Nothing else is required — no keys, no database.

---

## Optional: cross-device sync (Supabase)

1. Create a new project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `collections` table with Row-Level Security so each user can only read/write their own rows.
   > Tip: after deploying you can just open **`/setup`** on your site and copy the SQL from there — it also shows a live checklist of what's still missing.
3. **(Optional) Google login.** Email/password works out of the box with **no** extra setup, so you can skip this. To also offer Google: in Supabase go to **Authentication → Providers → Google**, enable it, and add your Google OAuth **Client ID / Secret** (create them in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)) with the **Authorized redirect URI**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Then set `NEXT_PUBLIC_GOOGLE_ENABLED=true` so the button appears.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## Optional: environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
# optional — defaults to claude-sonnet-5
FINDER_MODEL=claude-sonnet-5
# optional — set to true only after enabling Google in Supabase
NEXT_PUBLIC_GOOGLE_ENABLED=false
```

> Not sure what's configured? Open **`/setup`** in the running app for a live checklist.


## Model & cost

The finder uses Claude with its built-in `web_search` tool. Pick the model via `FINDER_MODEL`:

| Model | Cost (in / out per 1M tokens) | Notes |
| --- | --- | --- |
| `claude-sonnet-5` (default) | $3 / $15 | Best balance for a hobby finder |
| `claude-opus-4-8` | $5 / $25 | Highest quality |
| `claude-haiku-4-5` | $1 / $5 | Cheapest (uses the older, basic web-search tool) |

You pay Anthropic per search based on tokens used; a typical plush search is a few cents or less.

---

## Project structure

| Path | Purpose |
| --- | --- |
| `app/api/find/route.ts` | Optional Claude web-search finder |
| `app/page.tsx` | The site (character grid + finder) |
| `app/login/page.tsx`, `components/AuthForm.tsx` | Sign in / sign up (email + Google) |
| `app/auth/callback/route.ts` | OAuth / email-confirm callback |
| `middleware.ts`, `lib/supabase/*` | Optional Supabase session handling |
| `hooks/useCollection.ts` | Collection state (device storage, or Supabase when signed in) |
| `lib/sprunki.ts` | Character roster (series, phase, art) + finder prompt |
| `supabase/schema.sql` | Database table + Row-Level Security policy |

---

## Notes

- SprunkFind links out to third-party listings and always shows the source domain so a parent can vet a listing before buying. It is not a store and processes no payments.
- Kid accounts are meant to be created and managed by a parent; the app stores only an email and the collection.
