import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mockCompanies, mockJobs } from "@/lib/mock-data";
import type { CareerConfig, Company, Job } from "@/types";

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  admin_email: string;
  password_hash: string;
  is_published: boolean;
  draft_config: CareerConfig;
  draft_version: number;
  published_config: CareerConfig | null;
};

type JobRow = {
  id: string;
  title: string;
  location: string;
  work_type: Job["workType"];
  employment_type: Job["employmentType"];
  salary: string | null;
  experience_level: string | null;
  description: string;
  key_responsibilities?: string | null;
  tech_stack?: string | null;
  posted_at: string;
};

function throwSupabaseError(error: { message?: string; details?: string | null } | null) {
  if (!error) return;
  const message = [error.message, error.details].filter(Boolean).join(" | ");
  throw new Error(message || "Supabase query failed.");
}

function isDraftVersionMissingError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  const lower = msg.toLowerCase();
  return (
    lower.includes("draft_version") &&
    (lower.includes("schema cache") ||
      lower.includes("could not find") ||
      lower.includes("column") ||
      lower.includes("does not exist"))
  );
}

function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    adminEmail: row.admin_email,
    passwordHash: row.password_hash,
    isPublished: row.is_published,
    draftVersion: row.draft_version ?? 0,
    draftConfig: row.draft_config,
    publishedConfig: row.published_config
  };
}

export async function findCompanyByEmail(email: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return mockCompanies.find((c) => c.adminEmail.toLowerCase() === email.toLowerCase()) ?? null;
  }

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .ilike("admin_email", email)
    .maybeSingle();
  throwSupabaseError(error);
  return data ? mapCompanyRow(data) : null;
}

export async function findCompanyBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return mockCompanies.find((c) => c.slug === slug) ?? null;
  }
  const { data, error } = await supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
  throwSupabaseError(error);
  return data ? mapCompanyRow(data) : null;
}

export async function createCompany(input: { name: string; slug: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const initialConfig: CareerConfig = {
    companyName: input.name,
    tagline: "We are hiring exceptional people.",
    themeColor: "#2563eb",
    logoUrl: "",
    bannerUrl: "",
    cultureVideoUrl: "",
    sections: [
      { id: "about-1", type: "about", title: "About Us", content: "Tell candidates about your mission." },
      { id: "life-1", type: "life", title: "Life at Company", layout: "text", content: "Share your team culture." }
    ]
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const company: Company = {
      id: crypto.randomUUID(),
      slug: input.slug,
      name: input.name,
      adminEmail: input.email,
      passwordHash,
      isPublished: false,
      draftVersion: 0,
      draftConfig: initialConfig,
      publishedConfig: null
    };
    mockCompanies.push(company);
    return company;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      slug: input.slug,
      name: input.name,
      admin_email: input.email,
      password_hash: passwordHash,
      draft_config: initialConfig,
      is_published: false,
      published_config: null
    })
    .select("*")
    .single();
  throwSupabaseError(error);
  return mapCompanyRow(data);
}

export async function updateDraftConfig(slug: string, draftConfig: CareerConfig) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const company = mockCompanies.find((c) => c.slug === slug);
    if (!company) return null;
    company.draftConfig = draftConfig;
    company.draftVersion += 1;
    return company;
  }

  const current = await findCompanyBySlug(slug);
  if (!current) return null;

  try {
    const { data, error } = await supabase
      .from("companies")
      .update({ draft_config: draftConfig, draft_version: current.draftVersion + 1 })
      .eq("slug", slug)
      .select("*")
      .single();
    throwSupabaseError(error);
    return mapCompanyRow(data as CompanyRow);
  } catch (err) {
    if (!isDraftVersionMissingError(err)) throw err;
    // Migration not applied yet: save without versioning so the app doesn't break.
    const { data, error } = await supabase
      .from("companies")
      .update({ draft_config: draftConfig })
      .eq("slug", slug)
      .select("*")
      .single();
    throwSupabaseError(error);
    return mapCompanyRow(data as CompanyRow);
  }
}

export async function updateDraftConfigWithVersion(
  slug: string,
  draftConfig: CareerConfig,
  expectedDraftVersion: number
): Promise<
  | { ok: true; company: Company }
  | { ok: false; latest: Company | null }
> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const company = mockCompanies.find((c) => c.slug === slug);
    if (!company) return { ok: false, latest: null };
    if (company.draftVersion !== expectedDraftVersion) {
      return { ok: false, latest: company };
    }
    company.draftConfig = draftConfig;
    company.draftVersion += 1;
    return { ok: true, company };
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .update({
        draft_config: draftConfig,
        draft_version: expectedDraftVersion + 1
      })
      .eq("slug", slug)
      .eq("draft_version", expectedDraftVersion)
      .select("*")
      .maybeSingle();

    throwSupabaseError(error);
    if (data) {
      return { ok: true, company: mapCompanyRow(data as CompanyRow) };
    }

    const latest = await findCompanyBySlug(slug);
    return { ok: false, latest };
  } catch (err) {
    if (!isDraftVersionMissingError(err)) throw err;
    // Migration not applied yet: fall back to "save without conflict detection".
    const company = await updateDraftConfig(slug, draftConfig);
    if (!company) return { ok: false, latest: null };
    return { ok: true, company };
  }
}

export async function clearCompanyDraft(slug: string, draftConfig: CareerConfig) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const company = mockCompanies.find((c) => c.slug === slug);
    if (!company) return null;
    company.draftConfig = draftConfig;
    company.draftVersion = 0;
    company.isPublished = false;
    company.publishedConfig = null;
    return company;
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .update({
        draft_config: draftConfig,
        draft_version: 0,
        published_config: null,
        is_published: false
      })
      .eq("slug", slug)
      .select("*")
      .single();
    throwSupabaseError(error);
    return mapCompanyRow(data as CompanyRow);
  } catch (err) {
    if (!isDraftVersionMissingError(err)) throw err;
    // Migration not applied yet: clear without draft_version.
    const { data, error } = await supabase
      .from("companies")
      .update({
        draft_config: draftConfig,
        published_config: null,
        is_published: false
      })
      .eq("slug", slug)
      .select("*")
      .single();
    throwSupabaseError(error);
    return mapCompanyRow(data as CompanyRow);
  }
}

export async function deleteJobsByCompanySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Mock mode: jobs are global, so clear them all.
    mockJobs.splice(0, mockJobs.length);
    return;
  }

  const { error } = await supabase.from("jobs").delete().eq("company_slug", slug);
  throwSupabaseError(error);
}

export async function publishCompany(slug: string) {
  const company = await findCompanyBySlug(slug);
  if (!company) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    company.isPublished = true;
    company.publishedConfig = company.draftConfig;
    return company;
  }

  const { data, error } = await supabase
    .from("companies")
    .update({
      is_published: true,
      published_config: company.draftConfig
    })
    .eq("slug", slug)
    .select("*")
    .single();
  throwSupabaseError(error);
  return mapCompanyRow(data);
}

export async function verifyLogin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  let company = await findCompanyByEmail(normalized);
  if (!company) {
    company = await findCompanyBySlug(
      normalized
        .replace(/@.*/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }
  if (!company) return null;
  const valid = await bcrypt.compare(password, company.passwordHash);
  return valid ? company : null;
}

export async function getPublicCareersData(slug: string) {
  const company = await findCompanyBySlug(slug);
  if (!company || !company.isPublished || !company.publishedConfig) return null;
  const jobs = await listJobs(slug);
  return { company, config: company.publishedConfig, jobs };
}

export async function listJobs(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return mockJobs;
  }
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_slug", slug)
    .order("posted_at", { ascending: false });
  throwSupabaseError(error);
  return ((data as JobRow[] | null | undefined) ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    location: row.location,
    workType: row.work_type,
    employmentType: row.employment_type,
    salary: row.salary ?? "",
    experienceLevel: row.experience_level ?? "",
    description: row.description,
    keyResponsibilities: row.key_responsibilities ?? "",
    techStack: row.tech_stack ?? "",
    postedAt: row.posted_at
  })) as Job[];
}

export async function createJob(slug: string, input: Omit<Job, "id" | "postedAt">) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const newJob: Job = { ...input, id: crypto.randomUUID(), postedAt: new Date().toISOString() };
    mockJobs.unshift(newJob);
    return newJob;
  }
  let data: JobRow | null = null;
  let error: { message?: string; details?: string | null } | null = null;

  const withExtendedFields = await supabase
    .from("jobs")
    .insert({
      company_slug: slug,
      title: input.title,
      location: input.location,
      work_type: input.workType,
      employment_type: input.employmentType,
      salary: input.salary,
      experience_level: input.experienceLevel,
      description: input.description,
      key_responsibilities: input.keyResponsibilities ?? "",
      tech_stack: input.techStack ?? ""
    })
    .select("*")
    .single();

  if (withExtendedFields.error && withExtendedFields.error.message?.toLowerCase().includes("column")) {
    const fallback = await supabase
      .from("jobs")
      .insert({
        company_slug: slug,
        title: input.title,
        location: input.location,
        work_type: input.workType,
        employment_type: input.employmentType,
        salary: input.salary,
        experience_level: input.experienceLevel,
        description: input.description
      })
      .select("*")
      .single();
    data = (fallback.data as JobRow | null) ?? null;
    error = fallback.error;
  } else {
    data = (withExtendedFields.data as JobRow | null) ?? null;
    error = withExtendedFields.error;
  }

  throwSupabaseError(error);
  if (!data) {
    throw new Error("Failed to create job.");
  }
  return {
    id: data.id,
    title: data.title,
    location: data.location,
    workType: data.work_type,
    employmentType: data.employment_type,
    salary: data.salary ?? "",
    experienceLevel: data.experience_level ?? "",
    description: data.description,
    keyResponsibilities: data.key_responsibilities ?? input.keyResponsibilities ?? "",
    techStack: data.tech_stack ?? input.techStack ?? "",
    postedAt: data.posted_at
  } as Job;
}
