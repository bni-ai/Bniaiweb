import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveAccessDecision, type AppRole } from "./lib/access-control";

function getRole(request: NextRequest): AppRole {
  const role = request.cookies.get("sb-role")?.value;
  if (role === "admin" || role === "member" || role === "guest") return role;
  return null;
}

export function middleware(request: NextRequest) {
  const role = getRole(request);
  const { pathname } = request.nextUrl;
  const decision = resolveAccessDecision(pathname, role);
  if (decision.allow) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-current-path", pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  return NextResponse.redirect(new URL(decision.redirectTo ?? "/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
