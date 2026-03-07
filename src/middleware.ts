import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const hasAccess = request.cookies.get("site_access")?.value === "granted"

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - /gate (the email gate itself)
     * - /api (API routes including /api/gate)
     * - /_next (Next.js internals)
     * - /favicon.ico, /images, static files
     */
    "/((?!gate|api|_next|favicon\\.ico|images|.*\\.).*)",
  ],
}
