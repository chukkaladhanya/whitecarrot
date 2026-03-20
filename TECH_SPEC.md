## Tech Spec — Careers Page Builder (MVP)

This document outlines the MVP version of the Careers Page Builder. The goal is simple: allow a company to log in, create/edit their careers page, preview it, and publish it for candidates. It also includes basic safeguards to prevent multiple admins from accidentally overwriting each other’s changes.


## Assumptions

* Each company is identified by a unique slug and gets its own routes:

  * `/[company-slug]/edit`
  * `/[company-slug]/preview`
  * `/[company-slug]/careers`

* The editor and preview routes are protected. Only the logged-in company admin should be able to access them. This is enforced both at the UI level and API level.

* Authentication is session-based using an HTTP-only cookie (`cpb_session`) that stores the company slug.

* Supabase may not always be configured (especially during local development). If environment variables are missing, the app falls back to an in-memory mock so UI work isn’t blocked.

* Draft saving uses optimistic concurrency. If two people edit at the same time, conflicts are detected using `draft_version`.

* If the `draft_version` column isn’t available yet (e.g., migrations not applied), the backend gracefully falls back to saving without conflict detection.



## Architecture (High Level)

### Frontend — Next.js (App Router)

Main routes:

* `/` — marketing homepage
* `/login` — login / signup
* `/[company-slug]/edit` — draft editor (form + live preview)
* `/[company-slug]/preview` — draft preview
* `/[company-slug]/careers` — public careers page
* `/[company-slug]/careers/[jobId]` — job details
* `/not-ready` — placeholder route for unfinished links

Shared types are defined in `types/index.ts`.



### Route Protection

Handled via `proxy.ts`.

Restricted routes:

* `/:companySlug/edit`
* `/:companySlug/preview`

Logic:

* Checks for `cpb_session` cookie
* Verifies it matches the route slug
* Redirects to `/login` if invalid/missing



### Backend — API Routes + Data Layer

All API routes live under `app/api/`.

Core endpoints:

* `POST /api/auth/login` → sets session cookie
* `POST /api/auth/signup` → creates company + sets session
* `GET /api/company/[slug]` → fetch draft + version
* `PUT /api/company/[slug]` → save draft
* `POST /api/company/[slug]` → publish draft
* `DELETE /api/company/[slug]` → reset draft + delete jobs

Jobs:

* `GET /api/jobs/[slug]` → list jobs
* `GET /api/jobs/[slug]/[jobId]` → job details
* `POST /api/jobs/[slug]` → create job

Public:

* `GET /api/careers/[slug]` → published careers page data

Data logic is centralized in `lib/data.ts`:

* Company CRUD
* Draft handling (with/without versioning)
* Publishing flow
* Job operations
* Mock fallback

Auth helpers → `lib/auth.ts`
Supabase setup → `lib/supabase.ts`, guarded by `lib/env.ts`



## Data Model

### Table: `companies`

* `id` (uuid, primary key)
* `slug` (text, unique, not null)
* `name` (text, not null)
* `admin_email` (text, unique, not null)
* `password_hash` (text, not null)
* `draft_config` (jsonb, not null)
* `draft_version` (integer, not null, default 0)
* `published_config` (jsonb, nullable)
* `is_published` (boolean, not null, default false)
* `created_at` (timestamptz, not null, default now())



### Table: `jobs`

* `id` (uuid, primary key)
* `company_slug` (text, not null, foreign key → companies.slug, on delete cascade)
* `title` (text, not null)
* `location` (text, not null)
* `work_type` (text, not null)
* `employment_type` (text, not null)
* `salary` (text, nullable)
* `experience_level` (text, nullable)
* `description` (text, not null)
* `key_responsibilities` (text, nullable)
* `tech_stack` (text, nullable)
* `posted_at` (timestamptz, not null, default now())



## Draft Config Shape

`CareerConfig` includes:

* `companyName`
* `tagline`
* `themeColor`
* `logoUrl`
* `bannerUrl`
* `cultureVideoUrl`
* `sections` (dynamic builder content)

Each section:

* `id`
* `type`: `"about"` or `"life"`
* `title`
* `content`
* `layout` (optional)
* `direction` (optional)
* `items` (optional)



## Concurrency Handling (Optimistic)

When the editor loads:

* Fetches `draft_config`
* Fetches `draft_version`

When saving:

* Sends `expectedDraftVersion`

Backend behavior:

* Updates only if versions match
* Increments `draft_version`
* If mismatch → returns latest data with `409 Conflict`

Frontend:

* Prompts the user to reload instead of silently overwriting changes

Fallback:

* If `draft_version` column is missing → save proceeds without version checks



## Test Plan

### Local Dev (Without Supabase)

1. Start the app and navigate to `/login`
2. Sign up with a new company slug
3. Confirm redirect to editor
4. Make changes and save
5. Refresh and verify UI still works (mock data)
6. Click “Clear all” and confirm reset



### With Supabase (Full Flow)

1. Apply schema
2. Sign up and verify company record in DB
3. Login and confirm `cpb_session` cookie exists
4. Open editor and verify draft + version
5. Save changes and confirm version increments

**Concurrency test:**

* Open editor in two tabs
* Save in tab A
* Save in tab B → expect conflict

**Other checks:**

* Clear all resets data
* Publish updates public page
* Job detail page renders correctly



### API Checks

* Unauthorized access → redirect to `/login`
* Slug mismatch → returns `401 Unauthorized`
* Invalid payload → returns `400 Bad Request`



## Known Gaps (MVP)

* Footer links are placeholders
* No file upload support (URL-based assets only)
* No audit logs yet (only versioning for conflict handling)


