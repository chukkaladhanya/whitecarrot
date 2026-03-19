"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Job } from "@/types";
import { CareersFooter } from "@/app/CareersFooter";

type Props = {
  params: Promise<{
    "company-slug": string;
    jobId: string;
  }>;
};

function parseTokens(value?: string) {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function JobDetailsPage({ params }: Props) {
  const [slug, setSlug] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setSlug(resolved["company-slug"]);

      // Fetch company config so footer can show the correct company name.
      const companyRes = await fetch(`/api/careers/${resolved["company-slug"]}`);
      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanyName(companyData?.config?.companyName || "");
      }

      const res = await fetch(`/api/jobs/${resolved["company-slug"]}/${resolved.jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      setJob(data);
    })();
  }, [params]);

  if (!job) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-slate-600 sm:p-8">
        Loading job details...
      </main>
    );
  }

  const responsibilities = parseTokens(job.keyResponsibilities);
  const stackItems = parseTokens(job.techStack);

  return (
    <main className="min-h-screen min-w-0 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl min-w-0 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur sm:rounded-3xl sm:p-7 md:p-8">
        <Link className="text-sm font-semibold text-indigo-600 hover:underline" href={`/${slug}/careers`}>
          Back to careers
        </Link>
        <h1 className="mt-4 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          {job.title}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Job Details</p>

        <div className="mt-5 grid gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 text-sm text-slate-700 md:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-900">Employment Type:</span> {job.employmentType || "Not specified"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Work Policy:</span> {job.workType || "Not specified"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Location:</span> {job.location || "Not specified"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Experience Level:</span>{" "}
            {job.experienceLevel || "Not specified"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Salary:</span> {job.salary || "Not specified"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Posted On:</span>{" "}
            {new Date(job.postedAt).toLocaleDateString()}
          </p>
        </div>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Job Description</h2>
          <p className="mt-3 whitespace-pre-line break-words leading-7 text-slate-700">{job.description}</p>
        </section>
        {responsibilities.length ? (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Key Responsibilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {stackItems.length ? (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Tech Stack</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {stackItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}
        <button
          type="button"
          className="mt-7 w-full rounded-xl bg-gradient-to-r from-slate-900 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 sm:w-auto"
        >
          Apply Now
        </button>
      </div>
      <CareersFooter companyName={companyName || "Company"} />
    </main>
  );
}
