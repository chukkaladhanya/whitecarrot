import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionSlug } from "@/lib/auth";
import {
  clearCompanyDraft,
  deleteJobsByCompanySlug,
  findCompanyBySlug,
  publishCompany,
  updateDraftConfigWithVersion,
  updateDraftConfig
} from "@/lib/data";
import type { CareerConfig } from "@/types";

const configSchema = z.object({
  companyName: z.string().min(1),
  tagline: z.string(),
  themeColor: z.string(),
  logoUrl: z.string(),
  bannerUrl: z.string(),
  cultureVideoUrl: z.string(),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["about", "life"]),
      title: z.string(),
      content: z.string(),
      layout: z.enum(["text", "gallery", "cards"]).optional(),
      direction: z.enum(["grid", "list"]).optional(),
      items: z
        .array(
          z.object({
            id: z.string(),
            title: z.string().optional().default(""),
            body: z.string().optional().default(""),
            imageUrl: z.string().optional(),
            caption: z.string().optional()
          })
        )
        .optional()
    })
  )
});

const putSchema = configSchema.extend({
  expectedDraftVersion: z.number().int().nonnegative().optional()
});

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const company = await findCompanyBySlug(slug);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      slug: company.slug,
      name: company.name,
      isPublished: company.isPublished,
      draftConfig: company.draftConfig,
      draftVersion: company.draftVersion
    });
  } catch {
    return NextResponse.json({ error: "Failed to load company data." }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid config format.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { expectedDraftVersion } = parsed.data;
    const draftConfig: CareerConfig = {
      companyName: parsed.data.companyName,
      tagline: parsed.data.tagline,
      themeColor: parsed.data.themeColor,
      logoUrl: parsed.data.logoUrl,
      bannerUrl: parsed.data.bannerUrl,
      cultureVideoUrl: parsed.data.cultureVideoUrl,
      sections: parsed.data.sections
    };

    if (typeof expectedDraftVersion === "number") {
      const result = await updateDraftConfigWithVersion(slug, draftConfig, expectedDraftVersion);
      if (result.ok) {
        return NextResponse.json({ ok: true, draftConfig: result.company.draftConfig, draftVersion: result.company.draftVersion });
      }
      return NextResponse.json(
        {
          ok: false,
          error: "Version conflict",
          latestDraftConfig: result.latest?.draftConfig ?? null,
          latestDraftVersion: result.latest?.draftVersion ?? null
        },
        { status: 409 }
      );
    }

    const company = await updateDraftConfig(slug, draftConfig);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, draftConfig: company.draftConfig, draftVersion: company.draftVersion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await publishCompany(slug);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, isPublished: company.isPublished });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to publish.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const company = await findCompanyBySlug(slug);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Reset everything so the editor starts “from zero”.
    const emptyConfig = {
      ...company.draftConfig,
      themeColor: "#2563eb",
      tagline: "",
      logoUrl: "",
      bannerUrl: "",
      cultureVideoUrl: "",
      sections: []
    };

    await deleteJobsByCompanySlug(slug);
    const updated = await clearCompanyDraft(slug, emptyConfig);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, draftConfig: updated.draftConfig, draftVersion: updated.draftVersion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
