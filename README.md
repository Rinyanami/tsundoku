# 積ん読 · Tsundoku

Track every book you've ever owned — and the ones you've read. AI-powered recommendations based on your shelf.

---

## Deploy in 4 steps (no code knowledge needed)

### Step 1 — Upload to GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**, name it `tsundoku`, set to Public, click **Create repository**
3. On the next page, click **uploading an existing file**
4. Drag all files from this zip (extracted) into the upload area
5. Click **Commit changes**

### Step 2 — Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**, choose a name and password
3. Once created, go to **SQL Editor** in the left sidebar
4. Paste the entire contents of `supabase/schema.sql` and click **Run**
5. Go to **Settings > API** and copy:
   - `Project URL`
   - `anon public` key

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** and select your `tsundoku` repository
3. Before clicking Deploy, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `ANTHROPIC_API_KEY` | Get from [console.anthropic.com](https://console.anthropic.com) |

4. Click **Deploy** — Vercel builds and gives you a live URL in ~2 minutes

### Step 4 — Enable Supabase Auth emails

1. In Supabase, go to **Authentication > Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication > URL Configuration**
4. Set Site URL to your Vercel URL (e.g. `https://tsundoku.vercel.app`)

---

## That's it. Your app is live.

The URL Vercel gives you is your real website. You can share it with anyone.

---

## Tech stack

- **Next.js 14** — React framework
- **Supabase** — Database + Auth (free tier)
- **Tailwind CSS** — Styling
- **Claude Haiku** — AI recommendations
- **Google Books API** — Book data (free, no key needed to start)
- **Vercel** — Hosting (free tier)
