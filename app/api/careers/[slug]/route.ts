import { NextResponse } from "next/server";
import { getPublicCareersData } from "@/lib/data";

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const data = await getPublicCareersData(slug);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch careers page." }, { status: 500 });
  }
}
