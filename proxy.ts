import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(/^\/([^/]+)\/(edit|preview)$/);
  if (!match) return NextResponse.next();

  const slug = match[1];
  const sessionSlug = request.cookies.get("cpb_session")?.value;
  if (!sessionSlug || sessionSlug !== slug) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:companySlug/edit", "/:companySlug/preview"]
};
