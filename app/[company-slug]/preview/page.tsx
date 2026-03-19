"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BuilderSection, CareerConfig, Job } from "@/types";
import { CareersFooter } from "@/app/CareersFooter";

type Props = { params: Promise<{ "company-slug": string }> };

type DraftPayload = {
  draftConfig: CareerConfig;
};

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
    const classes = section.direction === "list" ? "mt-3 grid gap-3" : "mt-3 grid gap-3 sm:grid-cols-2";
    return (
      <div className={classes}>
        {(items.length ? items : ["Add one line per card in editor"]).map((item, index) => (
          <div
            key={`${section.id}-card-${index}`}
            className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-5"
          >
            <p className="text-center text-sm text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "gallery") {
    const bannerImage = section.items?.[0]?.imageUrl || "";
    const bannerCaption = section.items?.[0]?.caption || "";
    const isTextFirst = section.direction === "list";
    if (!bannerImage && !section.content) {
      return (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Add one image and text for this banner section.
        </div>
      );
    }

    const imageBlock = bannerImage ? (
      isHttpUrl(bannerImage) ? (
        <img className="h-40 w-full rounded-lg object-cover sm:h-56 md:h-64" src={bannerImage} alt="Section banner" />
      ) : (
        <div className="grid h-40 place-items-center rounded-lg bg-slate-100 px-3 text-center text-sm text-slate-600 sm:h-56 md:h-64">
          {bannerImage}
        </div>
      )
    ) : (
      <div className="grid h-40 place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 sm:h-56 md:h-64">
        No image added
      </div>
    );

    const textBlock = (
      <div className="flex items-center rounded-lg bg-white px-4 py-3 text-slate-700">
        <p className="w-full whitespace-pre-line text-center">{section.content || bannerCaption}</p>
      </div>
    );

    return (
      <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
        {isTextFirst ? textBlock : imageBlock}
        {isTextFirst ? imageBlock : textBlock}
      </div>
    );
  }

  return (
    <p className="mt-2 whitespace-pre-line text-center text-slate-700">
      {section.content || "No content added."}
    </p>
  );
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

export default function PreviewPage({ params }: Props) {
  const [slug, setSlug] = useState("");
  const [config, setConfig] = useState<CareerConfig | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    (async () => {
      const resolved = await params;
      const companySlug = resolved["company-slug"];
      setSlug(companySlug);

      const [companyRes, jobsRes] = await Promise.all([
        fetch(`/api/company/${companySlug}`),
        fetch(`/api/jobs/${companySlug}`)
      ]);
      if (companyRes.ok) {
        const companyData: DraftPayload = await companyRes.json();
        setConfig(companyData.draftConfig);
      }
      if (jobsRes.ok) {
        const jobsData: Job[] = await jobsRes.json();
        setJobs(jobsData);
      }
    })();
  }, [params]);

  if (!config) return <main className="p-8 text-slate-600">Loading preview...</main>;
  const bannerSrc =
    config.bannerUrl ||
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

  return (
    <main className="min-h-screen min-w-0 bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm font-medium text-slate-700">Draft Preview</p>
          <Link
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:w-auto"
            href={`/${slug}/edit`}
          >
            Back to Editor
          </Link>
        </div>
      </header>

      <section className="relative h-72 overflow-hidden bg-slate-900 sm:h-80 md:h-96">
        <img
          src={bannerSrc}
          alt={`${config.companyName} banner`}
          className="absolute inset-0 h-full w-full object-cover object-top -translate-y-2 sm:-translate-y-4 opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/5" />
        <div className="relative mx-auto flex h-full w-full max-w-6xl min-w-0 flex-col justify-center gap-2 px-4 py-10 text-white sm:justify-end sm:pb-8 sm:pt-0 sm:py-0 sm:px-6">
          <h1 className="text-2xl font-semibold sm:text-4xl">{config.companyName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-100 sm:text-base">{config.tagline}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          {config.sections.length ? (
            <div className="space-y-8 pb-8">
              {config.sections.map((section) => (
                <section key={section.id} className="border-b border-slate-200 pb-6 last:border-b-0">
                  <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {getSectionHeading(section, config.companyName)}
                  </h2>
                  <SectionContent section={section} />
                </section>
              ))}
            </div>
          ) : null}

          <div className={config.sections.length ? "border-t border-slate-200 pt-8" : ""}>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Join the Team, We&apos;re Hiring!
          </h2>
          <p className="mx-auto mt-3 max-w-4xl text-center text-base leading-7 text-slate-600">
            We&apos;ve shared our story. Now we&apos;d love to hear yours. If you&apos;re curious, driven, and
            looking for work that truly matters, let&apos;s connect. Your next chapter could start right here.
          </p>
          <div className="mt-4 space-y-3">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <h3 className="min-w-0 font-semibold">{job.title}</h3>
                  <span className="w-fit shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs">{job.employmentType}</span>
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
                <button
                  className="mt-3 rounded-lg bg-gradient-to-r from-slate-900 to-indigo-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Apply Now
                </button>
              </article>
            ))}
            {!jobs.length ? <p className="text-sm text-slate-500">No jobs added yet.</p> : null}
          </div>
          </div>
        </div>
      </section>
      <CareersFooter companyName={config.companyName} />
    </main>
  );
}