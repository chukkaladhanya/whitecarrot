"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BuilderSection, CareerConfig, Job } from "@/types";
import { CareersFooter } from "@/app/CareersFooter";

type CareersPayload = {
  config: CareerConfig;
  jobs: Job[];
};

type CareersPageProps = { params: Promise<{ "company-slug": string }> };

function getCardItems(content: string) {
  return content
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function SectionContent({ section }: { section: BuilderSection }) {
  const layout = section.layout ?? "text";

  if (layout === "cards") {
    const items =
      section.items && section.items.length
        ? section.items.map((item) => item.body).filter(Boolean)
        : getCardItems(section.content);
    const classes = section.direction === "list" ? "mt-4 grid gap-3" : "mt-4 grid gap-3 sm:grid-cols-2";
    return (
      <div className={classes}>
        {(items.length ? items : ["No content added."]).map((item, index) => (
          <div
            key={`${section.id}-card-${index}`}
            className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5 text-slate-700 shadow-sm"
          >
            <p className="text-center text-sm">{item}</p>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "gallery") {
    const bannerImage = section.items?.[0]?.imageUrl || "";
    const bannerCaption = section.items?.[0]?.caption || "";
    const isTextFirst = section.direction === "list";
    const imageBlock = bannerImage ? (
      isHttpUrl(bannerImage) ? (
        <img className="h-40 w-full rounded-xl object-cover sm:h-56 md:h-64" src={bannerImage} alt="Section banner" />
      ) : (
        <div className="grid h-40 place-items-center rounded-xl bg-slate-100 px-3 text-center text-sm text-slate-600 sm:h-56 md:h-64">
          {bannerImage}
        </div>
      )
    ) : (
      <div className="grid h-40 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500 sm:h-56 md:h-64">
        No image added
      </div>
    );
    const textBlock = (
      <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 text-slate-700">
        <p className="w-full whitespace-pre-line text-center">{section.content || bannerCaption || "No content added."}</p>
      </div>
    );

    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {isTextFirst ? textBlock : imageBlock}
        {isTextFirst ? imageBlock : textBlock}
      </div>
    );
  }

  return <p className="mt-3 whitespace-pre-line text-center leading-7 text-slate-700">{section.content || "No content added."}</p>;
}

function getSectionHeading(section: BuilderSection, companyName: string) {
  const title = (section.title ?? "").trim();
  const isDefaultLifeTitle =
    section.type === "life" && (!title || title.toLowerCase() === "life at company");

  if (isDefaultLifeTitle) {
    return `Life at ${companyName || "Company"}`;
  }

  return title || "Section";
}

export default function CareersPage({ params }: CareersPageProps) {
  const [slug, setSlug] = useState("");
  const [payload, setPayload] = useState<CareersPayload | null>(null);
  const [query, setQuery] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workType, setWorkType] = useState("");

  useEffect(() => {
    (async () => {
      const resolved = await params;
      const companySlug = resolved["company-slug"];
      setSlug(companySlug);
      const res = await fetch(`/api/careers/${companySlug}`);
      if (!res.ok) return;
      const data = await res.json();
      setPayload(data);
    })();
  }, [params]);

  const filteredJobs = useMemo(() => {
    if (!payload) return [];
    return payload.jobs.filter((job) => {
      const matchesQuery = query ? job.title.toLowerCase().includes(query.toLowerCase()) : true;
      const matchesTitle = jobTitle ? job.title === jobTitle : true;
      const matchesLocation = location ? job.location === location : true;
      const matchesEmploymentType = employmentType ? job.employmentType === employmentType : true;
      const matchesWorkType = workType ? job.workType === workType : true;
      return matchesQuery && matchesTitle && matchesLocation && matchesEmploymentType && matchesWorkType;
    });
  }, [payload, query, jobTitle, location, employmentType, workType]);

  if (!payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Careers page not available yet for {slug || "this company"}.
        </p>
      </main>
    );
  }

  const { config } = payload;
  const bannerSrc =
    config.bannerUrl ||
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";
  const jobTitles = [...new Set(payload.jobs.map((job) => job.title))];
  const locations = [...new Set(payload.jobs.map((job) => job.location))];
  const employmentTypes = [...new Set(payload.jobs.map((job) => job.employmentType))];
  const workTypes = [...new Set(payload.jobs.map((job) => job.workType))];

  return (
    <main className="min-h-screen min-w-0 bg-slate-50">
      <header className="relative h-72 overflow-hidden bg-slate-900 sm:h-80 md:h-96">
        {/* Light-blue sunlight glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(56,189,248,0.45),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.35),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(34,211,238,0.25),transparent_55%)]" />

        <img
          src={bannerSrc}
          alt={`${config.companyName} banner`}
          className="absolute inset-0 h-full w-full object-cover object-top -translate-y-2 sm:-translate-y-4 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/25" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl min-w-0 flex-col justify-center gap-2 px-4 py-10 text-white sm:justify-end sm:pb-8 sm:pt-0 sm:py-0 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Careers at{" "}
            <span className="text-cyan-300">
              {config.companyName}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-100 sm:text-base md:text-lg">{config.tagline}</p>
        </div>
      </header>

      <section className="mx-auto mt-4 w-full max-w-6xl min-w-0 px-4 pb-10 sm:mt-6 sm:px-6 sm:pb-14">
        <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-5 shadow-[0_16px_36px_-22px_rgba(79,70,229,0.2)] backdrop-blur sm:rounded-3xl sm:px-6 sm:py-6 md:px-8">
          {config.sections.length ? (
            <div className="space-y-10 pb-10">
              {config.sections.map((section) => (
                <section key={section.id} className="border-b border-slate-200 pb-8 last:border-b-0">
                  <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
                    {getSectionHeading(section, config.companyName)}
                  </h2>
                  <SectionContent section={section} />
                </section>
              ))}
            </div>
          ) : null}

          <div className={config.sections.length ? "border-t border-slate-200 pt-8" : ""}>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              Join the Team, We&apos;re Hiring!
            </h2>
            <p className="mx-auto mt-3 max-w-4xl text-center text-base leading-7 text-slate-600">
              We&apos;ve shared our story. Now we&apos;d love to hear yours. If you&apos;re curious, driven, and
              looking for work that truly matters, let&apos;s connect. Your next chapter could start right here.
            </p>

          <div className="mt-6">
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="Search jobs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
            >
              <option value="">Workplace type</option>
              {workTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            >
              <option value="">All job titles</option>
              {jobTitles.map((title) => (
                <option key={title}>{title}</option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All locations</option>
              {locations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option value="">Employment type</option>
              {employmentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setQuery("");
                setJobTitle("");
                setLocation("");
                setEmploymentType("");
                setWorkType("");
              }}
            >
              Clear filters
            </button>
          </div>

            <div className="mt-5">
              {filteredJobs.map((job) => (
                <article key={job.id} className="border-b border-slate-200/90 py-4 last:border-b-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <h3 className="min-w-0 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{job.title}</h3>
                    <span className="w-fit shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {job.employmentType}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
                      <p>{job.location || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Work Policy</p>
                      <p>{job.workType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Experience Level</p>
                      <p>{job.experienceLevel || "Not specified"}</p>
                    </div>
                  </div>
                  <Link
                    className="mt-4 inline-block rounded-lg bg-gradient-to-r from-slate-900 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                    href={`/${slug}/careers/${job.id}`}
                  >
                    View Details
                  </Link>
                </article>
              ))}
              {!filteredJobs.length ? (
                <p className="py-3 text-sm text-slate-500">We haven&apos;t found matching jobs.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <CareersFooter companyName={config.companyName} />
    </main>
  );
}