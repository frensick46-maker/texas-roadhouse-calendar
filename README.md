## Team calendar & todo app

This is a React + TypeScript app (Vite) for your team to share calendar events and todo lists.

Right now it provides:

- Email/password authentication via Supabase
- A basic app shell with a header, user info, and sign-out
- A dashboard layout with placeholders for **Team calendar** and **Team todo lists**

We will iterate on features (shared events, team-specific lists, etc.) over time.

## 1. Prerequisites

- Node.js 18+ installed
- An internet connection
- A Supabase account (free tier is fine)

## 2. Install dependencies

From the project root:

```bash
npm install
```

## 3. Create a Supabase project

1. Go to `https://supabase.com` and create a new project.
2. In the project settings, find:
   - **Project URL**
   - **anon public key**

## 4. Configure environment variables

1. In the project root, create a file named `.env` based on `.env.example`.
2. Fill in the values:

```bash
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> Do **not** commit `.env` to source control; it is for local secrets only.

## 5. Run the app locally

From the project root:

```bash
npm run dev
```

Open the printed URL (typically `http://localhost:5173/`) in your browser.

## 6. Deploy online so your team can use it from anywhere

To give your team a link they can open from home (or anywhere), deploy the app to **Vercel** (free). You’ll get a URL like `https://your-app.vercel.app` to share.

### One-time setup

1. **Put the project on GitHub** (if it isn’t already):
   - Create a repo on [github.com](https://github.com), then in your project folder run:
   - `git init`
   - `git add .`
   - `git commit -m "Initial commit"`
   - `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
   - `git push -u origin main`
2. **Sign up at [vercel.com](https://vercel.com)** (free, use GitHub to log in).
3. **Import the project:**
   - Click **Add New… → Project**.
   - Import your GitHub repo (e.g. `YOUR_USERNAME/YOUR_REPO`).
   - Leave **Framework Preset** as Vite; **Root Directory** blank.
4. **Add environment variables** (same as your `.env`):
   - In the project settings on Vercel, open **Settings → Environment Variables**.
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Save.
5. **Create the shared events table in Supabase** (one-time):
   - In the Supabase dashboard, open **SQL Editor** → **New query**.
   - Copy the contents of `supabase/events-table.sql` from this repo and paste into the editor, then **Run**.
   - This creates the `events` table and RLS so every signed-in user sees and can add/remove the same calendar events.
6. **Deploy:** Click **Deploy**. Vercel will build and publish the app.
7. **Share the link:** After deploy, Vercel shows a URL like `https://your-app.vercel.app`. Share that with your team. Everyone can open it from any network, sign in, and see the same shared calendar (events are stored in Supabase).

### Updating the live app

Push changes to your GitHub repo; Vercel will automatically rebuild and update the live site.

## 7. Open on your phone or share with others (same WiFi)

The dev server is set up so it’s reachable on your local network. After you run `npm run dev`:

1. In the terminal you’ll see two URLs, for example:
   - **Local:** `http://localhost:5173/`
   - **Network:** `http://192.168.x.x:5173/` (your PC’s IP on your WiFi)
2. On your **phone** (connected to the same WiFi as the PC):
   - Open the browser and go to the **Network** URL (e.g. `http://192.168.1.105:5173/`).
3. To let **other people** (same WiFi) use it:
   - Share that **Network** URL with them. They open it in their browser and can sign in with the same account.

Everyone can use the same login; the calendar and events are shared. The app layout adapts for small screens.

## 8. Using the app

- You will first see the **auth screen**.
- You can:
  - **Create account**: enter an email and password (at least 6 characters) to sign up.
  - **Sign in**: use the same credentials to log back in.
- After signing in, you will land on the **dashboard** with tabs for **Calendar** and **Team todos**. The calendar loads events from Supabase—everyone on the team sees the same events. Add or remove events; they are saved for the whole team. Use Team todos for shared lists (coming soon).

