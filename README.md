# SprunkFind 🧸🔎

An AI-powered web app for finding **Sprunki** plush toys (the *Incredibox – Sprunki* fan-mod characters: Wenda, Simon, Oren, Brud, Pinki, and more) from any "phase," and tracking a personal collection that syncs across devices.

- **AI Finder** — describe the plush you want ("Wenda Phase 5 plush") and Claude searches the web (Amazon, Etsy, eBay, dedicated Sprunki stores) and returns real, current buy-links with store, price, character, and phase.
- **Collection** — mark each character as **owned** or **wanted**, saved to your account so it follows you across phone, tablet, and computer.

Built with **Next.js (App Router)**, **Supabase** (accounts + Postgres), the **Anthropic API** (Claude with its server-side web-search tool), and **Tailwind CSS**. Deploys to **Vercel**.

---

## 🚀 One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fadamhintze-ship-it%2FSprunkfind&env=ANTHROPIC_API_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Anthropic%20API%20key%20%2B%20your%20Supabase%20project%20URL%20and%20anon%20key&envLink=https%3A%2F%2Fgithub.com%2Fadamhintze-ship-it%2FSprunkfind%233-configure-environment&project-name=sprunkfind&repository-name=sprunkfind)

The button clones this repo to your Vercel account and prompts for the three
environment variables. You only need two accounts, both free to start:

1. **Anthropic** → grab an API key at <https://console.anthropic.com/> (powers the finder).
2. **Supabase** → create a project at <https://supabase.com/> (accounts + database), then copy its **Project URL** and **anon public key** from *Project Settings → API*.

Paste those three values into the Vercel prompt and deploy. Then open
**`/setup`** on your new site — it shows a live checklist and the one SQL
snippet to paste into Supabase to finish. That's it.

> Prefer running locally first? Jump to [Run locally](#4-run-locally).

---

## How it works

```
Browser ──login──▶ Supabase Auth (email/password + Google)
Browser ──POST /api/find──▶ Next.js server ──▶ Claude (web_search tool) ──▶ live web
Browser ──collection──▶ Supabase Postgres (Row-Level Security: each user sees only their rows)
```

The `ANTHROPIC_API_KEY` lives only on the server (`app/api/find/route.ts`) and is never shipped to the browser.

---

## 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A free [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com/)

## 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `collections` table with Row-Level Security so each user can only read/write their own rows.
   > Tip: after deploying you can just open **`/setup`** on your site and copy the SQL from there — it also shows a live checklist of what's still missing.
3. **(Optional) Google login.** Email/password works out of the box with **no** extra setup, so you can skip this. To also offer Google: in Supabase go to **Authentication → Providers → Google**, enable it, and add your Google OAuth **Client ID / Secret** (create them in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)) with the **Authorized redirect URI**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Then set `NEXT_PUBLIC_GOOGLE_ENABLED=true` so the button appears.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 3. Configure environment

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

## 4. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Create an account (or use Google), then try the Finder and Collection tabs.

---

## Deploying to Vercel

1. Push this repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Add the three environment variables (`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; optionally `FINDER_MODEL`) in **Project Settings → Environment Variables**.
3. In Supabase **Authentication → URL Configuration**, add your Vercel URL (e.g. `https://sprunkfind.vercel.app`) to the **Site URL** / **Redirect URLs** so OAuth and email confirmations redirect back correctly.
4. Deploy. That's it.

---

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
| `app/api/find/route.ts` | Server route: Claude web-search finder (auth-gated) |
| `app/page.tsx` | Protected app (Finder + Collection tabs) |
| `app/login/page.tsx`, `components/AuthForm.tsx` | Sign in / sign up (email + Google) |
| `app/auth/callback/route.ts` | OAuth / email-confirm callback |
| `middleware.ts`, `lib/supabase/*` | Supabase session handling + route guard |
| `hooks/useCollection.ts` | Collection state backed by the `collections` table |
| `lib/sprunki.ts` | Character/phase roster + finder system prompt |
| `supabase/schema.sql` | Database table + Row-Level Security policy |

---

## Notes

- SprunkFind links out to third-party listings and always shows the source domain so a parent can vet a listing before buying. It is not a store and processes no payments.
- Kid accounts are meant to be created and managed by a parent; the app stores only an email and the collection.
