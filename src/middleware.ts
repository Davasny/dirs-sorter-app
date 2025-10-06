import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // if there is a cookie, and user comes to signin page, redirect to dashboard
  const loginPages = ["/signin", "/signup", "/password-reset"];
  // if path starts with any of the loginPages
  if (loginPages.some((page) => request.nextUrl.pathname.startsWith(page))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
};
