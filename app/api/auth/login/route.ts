import { NextResponse } from "next/server";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { verifyLogin } from "@/lib/data";

const loginSchema = z.object({
  userId: z.string().min(2),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const company = await verifyLogin(parsed.data.userId, parsed.data.password);
    if (!company) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await setSession(company.slug);
    return NextResponse.json({ slug: company.slug });
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
            ? `Unable to login. ${message}`
            : "Unable to login."
      },
      { status: 500 }
    );
  }
}
