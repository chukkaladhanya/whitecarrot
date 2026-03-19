import { NextResponse } from "next/server";
import { listJobs } from "@/lib/data";

export async function GET(_: Request, ctx: { params: Promise<{ slug: string; jobId: string }> }) {
  try {
    const { slug, jobId } = await ctx.params;
    const jobs = await listJobs(slug);
    const job = jobs.find((item) => item.id === jobId);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ error: "Failed to fetch job." }, { status: 500 });
  }
}
