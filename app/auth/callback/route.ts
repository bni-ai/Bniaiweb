import { NextResponse } from "next/server";

import { resolveAuthDestination } from "../../../lib/access-control";
import { createAdminClient } from "../../../lib/actions/admin-common";
import { createServerClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const redirectToError = new URL("/error", request.url);
  const redirectToLogin = new URL("/login", request.url);

  if (!code && !tokenHash) {
    return NextResponse.redirect(redirectToLogin);
  }

  const supabase = await createServerClient();
  const authResult = tokenHash
    ? await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type === "email" ? "email" : "magiclink",
      })
    : await supabase.auth.exchangeCodeForSession(code as string);

  if (authResult.error) {
    redirectToError.searchParams.set("reason", "exchange-failed");
    return NextResponse.redirect(redirectToError);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email;
  if (!email) {
    redirectToError.searchParams.set("reason", "missing-email");
    return NextResponse.redirect(redirectToError);
  }

  const adminClient = createAdminClient();
  const { data: memberData, error: memberError } = await adminClient
    .from("members" as never)
    .select("id, role")
    .ilike("email", email as never)
    .maybeSingle();

  const member = memberData as { id: string; role: string } | null;
  if (memberError) {
    redirectToError.searchParams.set("reason", "member-lookup-failed");
    return NextResponse.redirect(redirectToError);
  }

  const { data: guestData, error: guestError } = member
    ? { data: null, error: null }
    : await adminClient
        .from("guests" as never)
        .select("id")
        .ilike("email", email as never)
        .maybeSingle();

  if (guestError) {
    redirectToError.searchParams.set("reason", "guest-lookup-failed");
    return NextResponse.redirect(redirectToError);
  }

  const destination = resolveAuthDestination({
    memberRole: member?.role || null,
    isGuest: Boolean(guestData),
  });

  if (!destination.role) {
    redirectToError.searchParams.set("reason", "identity-not-found");
    redirectToError.searchParams.set("email", email);
    const response = NextResponse.redirect(redirectToError);
    response.cookies.delete("sb-role");
    return response;
  }

  const response = NextResponse.redirect(new URL(destination.redirectTo, request.url));

  response.cookies.set("sb-role", destination.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
