import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/signin", "/signup", "/password-reset"];

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  const sessionCookie = getSessionCookie(request);

  // 1) If you're on an auth page:
  //    - logged in -> go to dashboard
  //    - logged out -> allow access (no redirect loop)
  if (isAuthPage) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2) For all other pages, require a session
  if (!sessionCookie) {
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
