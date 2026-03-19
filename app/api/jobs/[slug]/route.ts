import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionSlug } from "@/lib/auth";
import { createJob, getPublicCareersData, listJobs } from "@/lib/data";

const jobSchema = z.object({
  title: z.string().min(2),
  location: z.string().min(2),
  workType: z.enum(["Remote", "Hybrid", "On-site", "Office"]),
  employmentType: z.enum(["Full-time", "Contract", "Part-time", "Intern"]),
  salary: z.string(),
  experienceLevel: z.string(),
  description: z.string().min(10),
  keyResponsibilities: z.string().optional().default(""),
  techStack: z.string().optional().default("")
});

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug === slug) {
      const jobs = await listJobs(slug);
      return NextResponse.json(jobs);
    }
    const data = await getPublicCareersData(slug);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data.jobs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const sessionSlug = await getSessionSlug();
    if (sessionSlug !== slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload.",
          details: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const job = await createJob(slug, parsed.data);
    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create job." }, { status: 500 });
  }
}
