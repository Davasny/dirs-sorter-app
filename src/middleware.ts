import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";

export const runtime = "nodejs";

const AUTH_PAGES = ["/signin", "/signup", "/password-reset"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  const session = await auth.api.getSession({ headers: request.headers });

  // 1) If you're on an auth page:
  //    - logged in -> go to dashboard
  //    - logged out -> allow access (no redirect loop)
  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2) For all other pages, require a session
  if (!session) {
    const url = new URL("/signin", request.url);
    return NextResponse.redirect(url);
  }

  // 3) Authenticated and not on an auth page -> continue
  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
};
