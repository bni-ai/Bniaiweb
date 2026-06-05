import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies, createRouteHandlerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const supabase = createRouteHandlerClient(request, response);

  try {
    await supabase.auth.signOut();
  } catch {
    // We still clear local cookies so protected routes cannot keep using stale state.
  }

  clearAuthCookies(request, response);
  return response;
}
