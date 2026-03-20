"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CareerConfig, BuilderSection, Job } from "@/types";

type EditPageProps = { params: Promise<{ "company-slug": string }> };

function getCardItems(content: string) {
  return content
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSections(sections: BuilderSection[]): BuilderSection[] {
  return sections.map((section) => {
    if (section.layout !== "cards") return section;

    let items = (section.items ?? []).map((item, index) => ({
      id: item.id || `${section.id}-item-${index}-${crypto.randomUUID()}`,
      title: item.title ?? "",
      body: item.body ?? "",
      imageUrl: item.imageUrl,
      caption: item.caption
    }));

    // Backward compatibility: if older data has only section.content, convert to items once.
    if (!items.length && section.content.trim()) {
      items = getCardItems(section.content).map((line, index) => ({
        id: `${section.id}-migrated-${index}-${crypto.randomUUID()}`,
        title: "",
        body: line,
        imageUrl: undefined,
        caption: undefined
      }));
    }

    return {
      ...section,
      direction: section.direction ?? "grid",
      items
    };
  });
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function PreviewSection({ section }: { section: BuilderSection }) {
  const layout = section.layout ?? "text";

  if (layout === "cards") {
    const items =
      section.items && section.items.length
        ? section.items.map((item) => item.body).filter(Boolean)
        : getCardItems(section.content);
    const classes = section.direction === "list" ? "mt-2 grid gap-2" : "mt-2 grid gap-2 sm:grid-cols-2";
    return (
      <div className={classes}>
        {(items.length ? items : ["Add one line per card"]).map((item, index) => (
          <div
            key={`${section.id}-card-${index}`}
            className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4"
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
    if (!bannerImage) {
      return (
        <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
          Add one image for this section.
        </div>
      );
    }

    const imageBlock = isHttpUrl(bannerImage) ? (
      <img className="h-28 w-full rounded-md object-cover" src={bannerImage} alt="Section banner" />
    ) : (
      <div className="grid h-28 place-items-center rounded-md bg-slate-100 text-xs text-slate-500">
        {bannerImage}
      </div>
    );

    const textBlock = (
      <div className="flex items-center rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <p className="line-clamp-4 w-full whitespace-pre-line text-center">{section.content || bannerCaption || "Section text appears here."}</p>
      </div>
    );

    return (
      <div className="mt-2 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-2">
        {isTextFirst ? textBlock : imageBlock}
        {isTextFirst ? imageBlock : textBlock}
      </div>
    );
  }

  return (
    <p className="mt-2 whitespace-pre-line text-center text-sm text-slate-700">
      {section.content || "No content yet."}
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

  return title || "Untitled Section";
}

const emptyConfig: CareerConfig = {
  companyName: "",
  tagline: "",
  themeColor: "#2563eb",
  logoUrl: "",
  bannerUrl: "",
  cultureVideoUrl: "",
  sections: []
};

export default function CompanyEditPage({ params }: EditPageProps) {
  const [companySlug, setCompanySlug] = useState("");
  const [config, setConfig] = useState<CareerConfig>(emptyConfig);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [draftVersion, setDraftVersion] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [jobMessage, setJobMessage] = useState("");
  const [openPanels, setOpenPanels] = useState({
    branding: false,
    sections: false,
    addJob: false
  });
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setCompanySlug(resolved["company-slug"]);
    })();
  }, [params]);

  useEffect(() => {
    if (!companySlug) return;
    (async () => {
      const [companyRes, jobsRes] = await Promise.all([
        fetch(`/api/company/${companySlug}`),
        fetch(`/api/jobs/${companySlug}`)
      ]);
      const data = await companyRes.json();
      if (companyRes.ok) {
        const normalizedSections = normalizeSections(data.draftConfig.sections ?? []);
        setDraftVersion(typeof data.draftVersion === "number" ? data.draftVersion : 0);
        setConfig({
          ...data.draftConfig,
          sections: normalizedSections
        });
        setOpenSectionIds(
          normalizedSections.reduce<Record<string, boolean>>((acc, section) => {
            acc[section.id] = false;
            return acc;
          }, {})
        );
      }
      if (jobsRes.ok) {
        const jobsData: Job[] = await jobsRes.json();
        setJobs(jobsData);
      }
      setLoading(false);
    })();
  }, [companySlug]);

  const themeStyle = useMemo(() => ({ borderColor: config.themeColor }), [config.themeColor]);

  function updateSection(index: number, patch: Partial<BuilderSection>) {
    setConfig((prev) => {
      const next = [...prev.sections];
      next[index] = { ...next[index], ...patch };
      return { ...prev, sections: next };
    });
  }

  function addSection() {
    const newId = crypto.randomUUID();
    setConfig((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newId,
          type: "about",
          title: "",
          content: "",
          layout: "text",
          direction: "grid",
          items: []
        }
      ]
    }));
    setOpenSectionIds((prev) => ({ ...prev, [newId]: true }));
  }

  function addCardItem(sectionIndex: number) {
    setConfig((prev) => {
    const nextSections = prev.sections.map((section, index) => {
      if (index !== sectionIndex) return section;
      return {
        ...section,
        items: [
          ...(section.items ?? []),
          {
            id: crypto.randomUUID(),
            title: "",
            body: ""
          }
        ]
      };
    });
    return { ...prev, sections: nextSections };
    });
  }

  function setGalleryImage(sectionIndex: number, imageUrl: string) {
    setConfig((prev) => {
      const nextSections = prev.sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        const first = section.items?.[0] ?? {
          id: crypto.randomUUID(),
          title: "",
          body: ""
        };
        return {
          ...section,
          items: [{ ...first, imageUrl }]
        };
      });
      return { ...prev, sections: nextSections };
    });
  }

  function updateCardItem(
    sectionIndex: number,
    itemIndex: number,
    patch: Partial<NonNullable<BuilderSection["items"]>[number]>
  ) {
    setConfig((prev) => {
    const nextSections = prev.sections.map((section, index) => {
      if (index !== sectionIndex) return section;
      const items = (section.items ?? []).map((item, i) =>
        i === itemIndex ? { ...item, ...patch } : item
      );
      return { ...section, items };
    });
    return { ...prev, sections: nextSections };
    });
  }

  function removeCardItem(sectionIndex: number, itemIndex: number) {
    setConfig((prev) => {
    const nextSections = prev.sections.map((section, index) => {
      if (index !== sectionIndex) return section;
      const items = (section.items ?? []).filter((_, i) => i !== itemIndex);
      return { ...section, items };
    });
    return { ...prev, sections: nextSections };
    });
  }

  function move(index: number, direction: "up" | "down") {
    setConfig((prev) => {
      const list = [...prev.sections];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, sections: list };
    });
  }

  function removeSection(index: number) {
    const sectionId = config.sections[index]?.id;
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    if (sectionId) {
      setOpenSectionIds((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
    }
  }

  function togglePanel(panel: keyof typeof openPanels) {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }

  function toggleSection(sectionId: string) {
    setOpenSectionIds((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  async function save() {
    if (isSaving || isPublishing || isClearing) return;
    setIsSaving(true);
    setMessage("Saving...");
    const res = await fetch(`/api/company/${companySlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...config, expectedDraftVersion: draftVersion })
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      setMessage("Saved draft.");
      setDraftVersion(typeof data?.draftVersion === "number" ? data.draftVersion : draftVersion + 1);
      setIsSaving(false);
      return;
    }

    if (res.status === 409) {
      const data = await res.json().catch(() => null);
      const confirmed = window.confirm(
        "Someone else saved changes for this company. Reload latest changes? Your current unsaved edits will be lost."
      );
      if (confirmed && data?.latestDraftConfig) {
        const normalizedSections = normalizeSections(data.latestDraftConfig.sections ?? []);
        setConfig({
          ...data.latestDraftConfig,
          sections: normalizedSections
        });
        setDraftVersion(typeof data.latestDraftVersion === "number" ? data.latestDraftVersion : 0);
        setOpenSectionIds(
          normalizedSections.reduce<Record<string, boolean>>((acc, section) => {
            acc[section.id] = false;
            return acc;
          }, {})
        );
        setMessage("Reloaded latest changes.");
      } else {
        setMessage("Save cancelled (version conflict).");
      }
      setIsSaving(false);
      return;
    }

    const data = await res.json().catch(() => null);
    setMessage(data?.error ? `Save failed: ${data.error}` : "Save failed.");
    setIsSaving(false);
  }

  async function publish() {
    if (isPublishing || isSaving || isClearing) return;
    setIsPublishing(true);
    setMessage("Publishing...");
    const res = await fetch(`/api/company/${companySlug}`, { method: "POST" });
    if (res.ok) {
      //setMessage("Published successfully.");
      //setIsPublishing(false);
      //return;
    
      const { origin, pathname } = window.location;
      const basePath = pathname.replace(/\/(edit|preview)\/?$/, "");
      const careersUrl = `${origin}${basePath}/careers`;
      setMessage(careersUrl);
      setIsPublishing(false);
      return;
    }
    const data = await res.json().catch(() => null);
    setMessage(data?.error ? `Publish failed: ${data.error}` : "Publish failed.");
    setIsPublishing(false);
  }

  async function clearAll() {
    if (isClearing || isSaving || isPublishing) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear everything for this company? This will delete all sections and jobs from the editor and from the database."
    );
    if (!confirmed) return;

    setIsClearing(true);
    setMessage("Clearing...");
    setJobMessage("");

    const res = await fetch(`/api/company/${companySlug}`, { method: "DELETE" });
    if (res.ok) {
      // Reset UI immediately so the preview goes back to empty.
      setConfig((prev) => ({
        ...prev,
        themeColor: "#2563eb",
        tagline: "",
        logoUrl: "",
        bannerUrl: "",
        cultureVideoUrl: "",
        sections: []
      }));
      setDraftVersion(0);
      setJobs([]);
      setOpenSectionIds({});
      setOpenPanels({ branding: true, sections: false, addJob: false });
      setMessage("Cleared. You can start fresh.");
      setIsClearing(false);
      return;
    }

    const data = await res.json().catch(() => null);
    setMessage(data?.error ? `Clear failed: ${data.error}` : "Clear failed.");
    setIsClearing(false);
  }

  async function addJob(formData: FormData) {
    const payload = {
      title: String(formData.get("title") ?? ""),
      location: String(formData.get("location") ?? ""),
      workType: String(formData.get("workType") ?? ""),
      employmentType: String(formData.get("employmentType") ?? ""),
      salary: String(formData.get("salary") ?? ""),
      experienceLevel: String(formData.get("experienceLevel") ?? ""),
      description: String(formData.get("description") ?? ""),
      keyResponsibilities: String(formData.get("keyResponsibilities") ?? ""),
      techStack: String(formData.get("techStack") ?? "")
    };
    const res = await fetch(`/api/jobs/${companySlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const createdJob: Job = await res.json();
      setJobs((prev) => [createdJob, ...prev]);
      setJobMessage("Job added.");
      return;
    }

    const errorData = await res.json().catch(() => null);
    const fieldErrors = errorData?.details as Record<string, string[] | undefined> | undefined;
    if (fieldErrors && typeof fieldErrors === "object") {
      const firstError = Object.values(fieldErrors).find((items) => Array.isArray(items) && items.length)?.[0];
      setJobMessage(firstError ? `Failed to add job: ${firstError}` : "Failed to add job.");
      return;
    }

    setJobMessage(errorData?.error ? `Failed to add job: ${errorData.error}` : "Failed to add job.");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-sm text-slate-600 sm:p-10">
        Loading builder...
      </main>
    );
  }

  return (
    <main className="min-h-screen min-w-0 bg-gradient-to-br from-slate-100 via-white to-indigo-50 px-3 py-4 sm:px-4 sm:py-6 md:px-8">
      <div className="relative z-30 mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:pb-5">
        <div className="min-w-0">
          <h1 className="bg-gradient-to-r from-slate-900 via-indigo-700 to-violet-700 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl md:text-4xl">
            Careers Builder
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Design, preview and publish your careers experience.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Link
            href={`/${companySlug}/preview`}
            target="_blank"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 sm:flex-initial sm:px-4"
          >
            Preview
          </Link>
          <button
            type="button"
            disabled={isSaving || isPublishing}
            className={`inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium shadow-sm transition-all active:scale-[0.98] sm:flex-initial sm:px-4 ${
              isSaving
                ? "cursor-not-allowed bg-slate-100 text-slate-500 opacity-80"
                : "cursor-pointer bg-white"
            } ${isPublishing ? "cursor-not-allowed opacity-60" : ""}`}
            onClick={() => {
              void save();
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            disabled={isPublishing || isSaving}
            className={`inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition-all active:scale-[0.98] sm:flex-initial sm:px-4 ${
              isPublishing
                ? "cursor-not-allowed bg-slate-500 opacity-80"
                : "cursor-pointer bg-gradient-to-r from-slate-900 to-indigo-700"
            } ${isSaving ? "cursor-not-allowed opacity-60" : ""}`}
            onClick={() => {
              void publish();
            }}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-1rem)] lg:overflow-y-auto xl:top-5 xl:max-h-[calc(100dvh-2rem)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => togglePanel("branding")}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Branding</h2>
              <span className="grid h-5 w-5 place-items-center rounded border border-slate-300 text-xs text-slate-500">
                {openPanels.branding ? "-" : "+"}
              </span>
            </button>
            {openPanels.branding ? <div className="mt-3 space-y-2">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={config.companyName}
                onChange={(e) => setConfig((p) => ({ ...p, companyName: e.target.value }))}
                placeholder="Company name"
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={config.tagline}
                onChange={(e) => setConfig((p) => ({ ...p, tagline: e.target.value }))}
                placeholder="Tagline"
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={config.bannerUrl}
                onChange={(e) => setConfig((p) => ({ ...p, bannerUrl: e.target.value }))}
                placeholder="Banner image URL"
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={config.cultureVideoUrl}
                onChange={(e) => setConfig((p) => ({ ...p, cultureVideoUrl: e.target.value }))}
                placeholder="Culture video URL"
              />
            </div> : null}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => togglePanel("sections")}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sections</h2>
                <span className="grid h-5 w-5 place-items-center rounded border border-slate-300 text-xs text-slate-500">
                  {openPanels.sections ? "-" : "+"}
                </span>
              </button>
            </div>

            {openPanels.sections ? <div className="mt-3 space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={addSection}
                  aria-label="Add section"
                >
                  Add section
                </button>
              </div>
              {config.sections.map((section, index) => (
                <article key={section.id} className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => toggleSection(section.id)}
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-slate-300 text-xs text-slate-500">
                        {openSectionIds[section.id] ? "-" : "+"}
                      </span>
                      <p className="min-w-0 text-sm font-medium text-slate-800">
                        {section.title?.trim() || `Section ${index + 1}`}
                      </p>
                    </button>
                    <div className="flex flex-wrap gap-1 sm:justify-end">
                      <button
                        type="button"
                        className="rounded border border-slate-300 bg-white px-2 text-xs"
                        onClick={() => move(index, "up")}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="rounded border border-slate-300 bg-white px-2 text-xs"
                        onClick={() => move(index, "down")}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-700"
                        onClick={() => removeSection(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {openSectionIds[section.id] ? (
                    <>
                  <input
                    className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={section.title}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                    placeholder="Section heading"
                  />
                  <select
                    className="mb-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    value={section.layout ?? "text"}
                    onChange={(e) =>
                      updateSection(index, { layout: e.target.value as BuilderSection["layout"] })
                    }
                  >
                    <option value="text">Text</option>
                    <option value="gallery">Image banner</option>
                    <option value="cards">Cards</option>
                  </select>
                  {section.layout === "gallery" ? (
                    <div className="mb-2 rounded-md border border-slate-200 bg-white p-2">
                      <div className="mb-2 flex flex-col gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-slate-600">Banner order</span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className={`rounded px-2 py-1 text-xs ${
                              (section.direction ?? "grid") === "grid"
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700"
                            }`}
                            onClick={() => updateSection(index, { direction: "grid" })}
                          >
                            Image then text
                          </button>
                          <button
                            type="button"
                            className={`rounded px-2 py-1 text-xs ${
                              (section.direction ?? "grid") === "list"
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700"
                            }`}
                            onClick={() => updateSection(index, { direction: "list" })}
                          >
                            Text then image
                          </button>
                        </div>
                      </div>
                      <input
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                        placeholder="Image URL"
                        value={section.items?.[0]?.imageUrl ?? ""}
                        onChange={(e) => setGalleryImage(index, e.target.value)}
                      />
                    </div>
                  ) : null}
                  {section.layout === "cards" ? (
                    <>
                      <div className="mb-2 flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-slate-600">Card layout direction</span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className={`rounded px-2 py-1 text-xs ${
                              (section.direction ?? "grid") === "grid"
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700"
                            }`}
                            onClick={() => updateSection(index, { direction: "grid" })}
                          >
                            Side by side
                          </button>
                          <button
                            type="button"
                            className={`rounded px-2 py-1 text-xs ${
                              (section.direction ?? "grid") === "list"
                                ? "bg-slate-900 text-white"
                                : "border border-slate-300 bg-white text-slate-700"
                            }`}
                            onClick={() => updateSection(index, { direction: "list" })}
                          >
                            Top to bottom
                          </button>
                        </div>
                      </div>
                      <div className="mb-2 space-y-2 rounded-md border border-slate-200 bg-white p-2">
                        {(section.items ?? []).map((item, itemIndex) => (
                          <div
                            key={item.id || `${section.id}-fallback-${itemIndex}`}
                            className="rounded border border-slate-200 p-2"
                          >
                            <textarea
                              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              rows={2}
                              placeholder="Card text"
                              value={item.body}
                              onChange={(e) =>
                                updateCardItem(index, itemIndex, { body: e.target.value })
                              }
                            />
                            <div className="mt-1 flex justify-end">
                              <button
                                type="button"
                                className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                                onClick={() => removeCardItem(index, itemIndex)}
                              >
                                Remove card
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                          onClick={() => addCardItem(index)}
                        >
                          + Add card
                        </button>
                      </div>
                    </>
                  ) : null}
                  {section.layout !== "cards" && (
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                      rows={4}
                      value={section.content}
                      onChange={(e) => updateSection(index, { content: e.target.value })}
                      placeholder={
                        section.layout === "gallery"
                          ? "Section text shown beside image"
                          : "Write section content..."
                      }
                    />
                  )}
                    </>
                  ) : null}
                </article>
              ))}
            </div> : null}
          </article>

          <form
            className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              await addJob(new FormData(form));
              form.reset();
            }}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => togglePanel("addJob")}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add Job</h3>
              <span className="grid h-5 w-5 place-items-center rounded border border-slate-300 text-xs text-slate-500">
                {openPanels.addJob ? "-" : "+"}
              </span>
            </button>
            {openPanels.addJob ? (
              <>
            <label className="block text-xs font-medium text-slate-600">
              Job Title <span className="text-rose-600">*</span>
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              name="title"
              placeholder="Job title"
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Location <span className="text-rose-600">*</span>
                </label>
                <input
                  className="w-full min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  name="location"
                  placeholder="Location"
                  required
                />
              </div>
              <div className="min-w-0 space-y-1">
                <label className="block text-xs font-medium text-slate-600">Work Policy</label>
                <select
                  className="w-full min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  name="workType"
                  defaultValue="Remote"
                  required
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <label className="block text-xs font-medium text-slate-600">Employment Type</label>
                <select
                  className="w-full min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  name="employmentType"
                  defaultValue="Full-time"
                  required
                >
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Part-time</option>
                </select>
              </div>
              <div className="min-w-0 space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Experience Level <span className="text-rose-600">*</span>
                </label>
                <input
                  className="w-full min-w-0 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  name="experienceLevel"
                  placeholder="Experience level"
                  required
                />
              </div>
            </div>
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              name="salary"
              placeholder="Salary"
            />
            <textarea
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              rows={3}
              name="description"
              placeholder="Description"
              required
            />
            <textarea
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              rows={3}
              name="keyResponsibilities"
              placeholder="Key Responsibilities (one per line or comma-separated)"
            />
            <input
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              name="techStack"
              placeholder="Tech Stack (e.g., React, Node.js, PostgreSQL)"
            />
            <button
              className="rounded-lg bg-gradient-to-r from-slate-900 to-indigo-700 px-3 py-2 text-sm text-white"
              type="submit"
            >
              Add job
            </button>
            {jobMessage ? <p className="text-xs text-slate-600">{jobMessage}</p> : null}
              </>
            ) : null}
          </form>

          {message ? (
            <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              {message}
            </p>
          ) : null}

          <div className="pt-4">
            <button
              type="button"
              onClick={() => {
                void clearAll();
              }}
              disabled={isClearing || isSaving || isPublishing}
              className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60"
            >
              {isClearing ? "Clearing..." : "Clear all"}
            </button>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Live Preview
            </h2>
            <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              Public View Style
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border-2 bg-white" style={themeStyle}>
            <div className="relative h-44 w-full overflow-hidden sm:h-60 md:h-72 lg:h-80">
              <img
                src={
                  config.bannerUrl ||
                  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1500&q=80"
                }
                alt={`${config.companyName || "Company"} banner`}
                className="absolute inset-0 h-full w-full object-cover object-top -translate-y-1 opacity-80"
              />
            </div>
            <div className="p-5">
              <h2 className="text-2xl font-semibold">{config.companyName || "Company Name"}</h2>
              <p className="mt-1 text-slate-600">
                {config.tagline || "Your company tagline appears here."}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {config.sections.map((section) => (
              <article key={section.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-center text-xl font-bold tracking-tight text-slate-900">
                  {getSectionHeading(section, config.companyName)}
                </h3>
                <PreviewSection section={section} />
              </article>
            ))}
            <article className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-center text-xl font-bold tracking-tight text-slate-900">
                Join the Team, We&apos;re Hiring!
              </h3>
              <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-slate-600">
                We&apos;ve shared our story. Now we&apos;d love to hear yours. If you&apos;re curious, driven, and
                looking for work that truly matters, let&apos;s connect.
              </p>
              <div className="mt-3 space-y-2">
                {jobs.length ? (
                  jobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                          {job.employmentType}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                        <div>
                          <p className="uppercase tracking-wide text-slate-500">Location</p>
                          <p>{job.location || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-wide text-slate-500">Work Policy</p>
                          <p>{job.workType || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No jobs added yet.</p>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
