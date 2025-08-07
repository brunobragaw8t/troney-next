import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./modules/auth/server/sessions";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // To remove when we have a landing page
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const session = await getSession();
  const loggedIn = session !== null;

  const authRoutes = ["/auth", "/activate"];
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (loggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!loggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL(authRoutes[0], req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
