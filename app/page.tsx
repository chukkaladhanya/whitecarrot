import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-950 text-white">
      {/* Light-blue ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.28),transparent_38%),radial-gradient(circle_at_80%_25%,rgba(99,102,241,0.22),transparent_40%),radial-gradient(circle_at_45%_85%,rgba(34,211,238,0.16),transparent_42%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
        {/* Hero */}
        <section className="grid gap-8 sm:gap-10">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-slate-200">
              Production-minded hiring pages for growing teams
            </p>

            <h1 className="font-serif text-3xl leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.05] md:text-6xl">
              Build Your Brand, Not a Template
            </h1>

            <p className="max-w-xl text-slate-300">
              Make hiring effortless with career pages that reflect each company’s unique identity.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-indigo-700 px-6 py-3 text-sm font-semibold shadow-sm shadow-indigo-500/20 transition hover:brightness-110 sm:w-auto"
              >
                Start Building
              </Link>
            </div>
          </div>

          {/* Right-side panel removed for cleaner hero */}
        </section>

        {/* 3 feature cards */}
        <section className="mt-12 sm:mt-16">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <span>🌍</span>
                </div>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Brand once, publish everywhere</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Customize colors, logo, banner imagery, and culture content for every tenant.
              </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <span>🔎</span>
                </div>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Candidate-friendly discovery</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Searchable, clean careers pages with fast loading and mobile-ready layout.
              </p>
            </div>

            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5">
                  <span>🧭</span>
                </div>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Preview before going live</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Iterate safely in draft mode with consistent preview across editor and public pages.
              </p>
            </div>
          </div>
        </section>

        {/* Optional How it works */}
        <section className="mt-12 sm:mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl">How it works</h2>
              <p className="mt-2 text-sm text-slate-300">
                A simple workflow for recruiters—and a great experience for candidates.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold">
                  1
                </span>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Design your sections</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">Add, reorder, and preview content blocks with layouts that match your brand.</p>
            </div>
            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold">
                  2
                </span>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Add jobs & roles</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">Create job listings with filters that help candidates find the right match.</p>
            </div>
            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold">
                  3
                </span>
                <h3 className="min-w-0 text-base font-semibold sm:text-lg">Preview and publish</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">Publish when you’re ready—candidates always see the latest public version.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
