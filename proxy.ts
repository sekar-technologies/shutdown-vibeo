import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow the root path
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2. Allow API routes (specifically the IP check)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 3. Allow static files (images, favicon, etc.) and Next.js internal files
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.includes(".") // Catch-all for files like .svg, .png
  ) {
    return NextResponse.next();
  }

  // 4. Proxy (Rewrite) all other paths to the main landing page
  // This keeps the URL same but shows the content of "/"
  return NextResponse.rewrite(new URL("/", request.url));
}

export const config = {
  // Matcher for all paths except those that usually shouldn't be redirected
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

