/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";

export function CareersFooter({ companyName }: { companyName: string }) {
  return (
    <section className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Social icons row */}
        <div className="flex items-center justify-center gap-7">
          <Link
            href="/not-ready"
            aria-label="Twitter (X)"
            className="cursor-pointer text-slate-800 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M18.9 2H22l-6.8 7.8L22.8 22H16.3l-5-6.5L5.2 22H2l7.4-8.5L1.2 2H7.9l4.5 5.9L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z" />
            </svg>
          </Link>

          <Link
            href="/not-ready"
            aria-label="LinkedIn"
            className="cursor-pointer text-[#0A66C2] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.4c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.07 1.41-2.07 2.86v5.49H9.46V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.4v6.34ZM5.34 7.43c-1.14 0-2.06-.93-2.06-2.08 0-1.15.92-2.08 2.06-2.08 1.15 0 2.08.93 2.08 2.08 0 1.15-.93 2.08-2.08 2.08ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
          </Link>

          <Link
            href="/not-ready"
            aria-label="Facebook"
            className="cursor-pointer text-[#1877F2] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
              <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v6.99A10 10 0 0 0 22 12Z" />
            </svg>
          </Link>
        </div>

        {/* Privacy notice text */}
        <p className="mt-7 text-center text-sm text-slate-500">
          {companyName || "Company"} collects and processes personal data in accordance with applicable data protection laws. If
          you are a European Job Applicant see the{" "}
          <Link href="/not-ready" className="font-medium text-slate-600 underline underline-offset-2 transition hover:text-slate-800">
            privacy notice
          </Link>{" "}
          for further details.
        </p>

        {/* View website / Help row */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm font-medium text-slate-700 sm:flex-row sm:gap-6">
          <Link
            href="/not-ready"
            className="inline-flex items-center gap-2 hover:opacity-90 hover:underline hover:underline-offset-2"
          >
            View website
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v7H3V3h7" />
            </svg>
          </Link>

          <Link
            href="/not-ready"
            className="inline-flex items-center gap-2 hover:opacity-90 hover:underline hover:underline-offset-2"
          >
            Help
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v7H3V3h7" />
            </svg>
          </Link>
        </div>

        {/* Bottom options row */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
          <p className="text-sm text-slate-600">
            Powered by <span className="font-semibold text-slate-900">{companyName || "Company"}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-700">
            <Link href="/not-ready" className="hover:opacity-90 hover:underline hover:underline-offset-2">
              Cookie settings
            </Link>
            <Link href="/not-ready" className="hover:opacity-90 hover:underline hover:underline-offset-2">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

