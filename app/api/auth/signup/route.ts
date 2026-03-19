import { NextResponse } from "next/server";
import { z } from "zod";
import { createCompany, findCompanyByEmail, findCompanyBySlug } from "@/lib/data";
import { setSession } from "@/lib/auth";

const signupSchema = z.object({
  companyName: z.string().min(2),
  userId: z.string().min(2),
  password: z.string().min(6)
});

function toSlug(userId: string) {
  return userId
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = toSlug(parsed.data.userId);
    if (!slug || slug.length < 2) {
      return NextResponse.json({ error: "User ID is invalid." }, { status: 400 });
    }

    const slugExists = await findCompanyBySlug(slug);
    if (slugExists) {
      return NextResponse.json({ error: "User ID is already taken." }, { status: 409 });
    }

    const derivedEmail = parsed.data.userId.includes("@")
      ? parsed.data.userId.toLowerCase()
      : `${slug}@company.local`;

    const emailExists = await findCompanyByEmail(derivedEmail);
    if (emailExists) {
      return NextResponse.json({ error: "User ID is already taken." }, { status: 409 });
    }

    const company = await createCompany({
      name: parsed.data.companyName,
      slug,
      email: derivedEmail,
      password: parsed.data.password
    });

    await setSession(company.slug);
    return NextResponse.json({ slug: company.slug }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Unable to sign up. ${message}`
            : "Unable to sign up."
      },
      { status: 500 }
    );
  }
}
