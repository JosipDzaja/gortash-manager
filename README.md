# Gortash Manager

A private, mobile-first character sheet for **Gortash Valemont** — Level 2 Half-Orc
Fighter, House Valemont, future Orcish Rune Knight. Built with Next.js (App Router) and
Supabase (Postgres + Auth). Installable as a PWA.

Tabs: **Overview**, **Combat**, **Inventory**, **Wallet**, **Quests**, **Backstory**, plus
a full 1→20 **Level Up** wizard (ASI/feats, HP rolls, Rune Knight progression).

Access is restricted to two allowlisted Google accounts (you + your DM) — see setup below.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), create a new project.
2. Once it's provisioned, open **Project Settings → API** and note:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Open the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql),
   and run it. This creates all tables, Row Level Security policies, and seeds Gortash's
   starting level-2 stat block, gear, gold, and first quest.
4. Still in the SQL Editor, allowlist the two emails that may sign in (yours and your
   DM's — must exactly match the Google accounts you'll sign in with):

   ```sql
   insert into app_allowed_emails (email) values
     ('you@example.com'),
     ('your-dm@example.com')
   on conflict do nothing;
   ```

## 2. Configure Google sign-in

1. In the Supabase dashboard: **Authentication → Sign In / Providers → Google**, and
   enable it.
2. You'll need a Google OAuth Client ID/Secret from the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth
   consent screen + "Web application" credentials). Supabase's provider page shows the
   exact **Authorized redirect URI** to paste into the Google Cloud credential
   (`https://<your-project-ref>.supabase.co/auth/v1/callback`).
3. In **Authentication → URL Configuration**, add your app's callback URL as an
   additional **Redirect URL**:
   - Local dev: `http://localhost:3000/auth/callback`
   - Production: `https://<your-vercel-domain>/auth/callback`

Anyone with a Google account can complete this OAuth flow — the `app_allowed_emails`
table (Row Level Security) and the `ALLOWED_EMAILS` env var (app-level check) are what
actually restrict access to just the two of you. Both must list the same emails.

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the three values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ALLOWED_EMAILS=you@example.com,your-dm@example.com
```

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`.

## 5. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel, or run `vercel deploy` from the CLI.
2. Add the same three environment variables from step 3 in the Vercel project settings
   (Production and Preview).
3. Add the production callback URL (`https://<your-domain>/auth/callback`) to Supabase's
   Redirect URLs (step 2.3) once you know your Vercel domain.
4. Install it as a PWA from your phone's browser share/menu ("Add to Home Screen") for a
   full-screen app-like experience at the table.

## Notes

- **Single character, single source of truth**: the `character` table always has exactly
  one row (`id = 1`). There's no character picker by design.
- **Level Up** (`/level-up`) walks through HP rolls, ASI-vs-feat choices at 4/6/8/12/14/16/19,
  and surfaces whatever Fighter/Rune Knight features unlock at the new level. Feats with
  simple, unambiguous effects (ability scores, proficiencies) auto-apply to the sheet;
  feats with conditional combat rules (Great Weapon Master, Sentinel, etc.) are shown as
  reference text only.
- **Rest**: the Combat tab's Short/Long Rest buttons reset Second Wind, Action Surge, and
  rune invocations (short or long); Indomitable, Warchief's Might, and Pack's Intercession
  only recharge on a long rest, matching the rules.
- Feat summaries under `src/lib/dnd/feats.ts` are original paraphrases, not verbatim
  Player's Handbook text.
