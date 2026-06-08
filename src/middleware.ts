import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "wgp_session";

// Edge-compatibele auth-gate. Vergelijkt cookie met AUTH_SECRET.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Publieke paden: login en de publieke verbeterplan-aanvraag (later).
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/verbeterplan");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = Boolean(token) && token === process.env.AUTH_SECRET;

  if (!authed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (authed && pathname.startsWith("/login")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
