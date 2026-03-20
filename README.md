# Demo of product 

video link : https://www.loom.com/share/b7fd32359f6e4e80a754195428879b37

# Careers Page Builder

A small Next.js app where each company gets its own careers site: banner, sections, job posts, and a preview before anything goes live. I built it as an MVP—enough to demo end-to-end without pretending it’s enterprise-ready.

## What’s actually in here

- **Marketing home** (`/`) — landing copy and a path into the product.
- **Login / signup** (`/login`) — creates or signs you into a company account (session cookie).
- **Editor** (`/[company-slug]/edit`) — left panel for draft config + jobs, live-ish preview on the right; save, publish, “clear all” (with confirm), and draft versioning so two tabs don’t silently clobber each other when Supabase has `draft_version` applied.
- **Preview** (`/[company-slug]/preview`) — draft careers page without exposing it as the public URL yet.
- **Public careers** (`/[company-slug]/careers`) — what candidates see when the company has published (or whatever your API layer serves for “public”).
- **Job detail** (`/[company-slug]/careers/[jobId]`) — single posting.
- **Placeholder links** (`/not-ready`) — footerLegal-style links dump here until you wire real pages.

Stack: **Next.js (App Router)**, **TypeScript**, **Tailwind**, **Zod** on APIs, **PostgreSQL via Supabase** with a **mock fallback** if env isn’t set—handy when you’re on the train without credentials.

## Run it locally

**You’ll need:** Node 20+ (anything recent that runs Next 16 is fine), npm.

```bash
git clone https://github.com/chukkaladhanya/whitecarrot
cd whitecarrot
npm install
```

**Environment**

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`


**Database**

In the Supabase SQL editor (or psql), run what’s in `supabase-schema.sql`. That creates `companies` and `jobs`. If you added features earlier, make sure `draft_version` exists on `companies` (it’s in the file) so optimistic saves behave as intended.

**Dev server**

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Lint: `npm run lint`.

## User guide (the path I’d walk someone through)

1. **Land on the site** — hit `/`, use “Start Building” (or whatever calls-to-action you left) to get to `/login`.
2. **Sign up** — pick a **company slug** you’ll remember; it becomes part of every URL (`/your-slug/...`). Same session is tied to that company after login.
3. **Redirection** — after login/signup user will be redirected  to `/[your-slug]/edit`. Set company name, tagline, banner image URL, sections (about / life-at, cards, gallery layouts, etc.), and add jobs with the form.
4. **Save often** — saves the draft. If someone else saved first, you may get a conflict prompt; reload and merge mentally—that’s the versioning doing its job.
5. **Preview** — `/[your-slug]/preview` shows draft content so you can sanity-check on mobile.
6. **Publish** — use the publish action in the editor when you’re happy; public careers reads from published config (per your backend rules).
7. **Share** — candidates use `/[your-slug]/careers` and click through to a job.

**“Clear all”** — bottom of the left panel, confirms, then wipes draft content and associated jobs in the DB (when Supabase is connected). Treat it as irreversible before clearing data an alert will be shown to admin.

## Repo layout (quick mental map)

- `app/` — routes, pages, API routes under `app/api/`
- `lib/` — data access, auth helpers, Supabase wiring, mock data
- `types/` — shared TypeScript shapes
- `supabase-schema.sql` — source of truth for tables
- `app/CareersFooter.tsx` — tenant footer; company name comes from config

## Improvement plan

These are the things I’d do before calling it “production” without air quotes:

- **Auth** — stronger session story (HTTP-only flags, rotation, CSRF if you add cookies to third-party contexts), optional email verification, password reset.
- **Media** — upload pipeline instead of paste-URL-only; image optimization and size limits.
- **SEO & OG** — per-company metadata, sitemap for `/careers` and job URLs.
- **Observability** — structured logging, error tracking, basic rate limiting on auth and save endpoints.
- **Testing** — a few Playwright flows (signup → edit → publish → public page) and API tests around versioning.
- **Multi-editor** — versioning helps, but you may still want audit log / activity feed for the same slug.

