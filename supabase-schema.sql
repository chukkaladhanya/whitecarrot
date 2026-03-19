create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  admin_email text unique not null,
  password_hash text not null,
  draft_config jsonb not null,
  draft_version integer not null default 0,
  published_config jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null references public.companies(slug) on delete cascade,
  title text not null,
  location text not null,
  work_type text not null,
  employment_type text not null,
  salary text,
  experience_level text,
  description text not null,
  key_responsibilities text,
  tech_stack text,
  posted_at timestamptz not null default now()
);
