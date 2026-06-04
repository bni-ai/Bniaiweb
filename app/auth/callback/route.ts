import { NextRequest, NextResponse } from "next/server";

import { AuthIdentityError, resolveAuthIdentityByEmail } from "../../../lib/auth/identity";
import { clearAuthCookies, copyResponseCookies, createRouteHandlerClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const redirectToError = new URL("/error", request.url);
  const redirectToLogin = new URL("/login", request.url);

  if (!code && !tokenHash) {
    return NextResponse.redirect(redirectToLogin);
  }

  const authResponse = NextResponse.next();
  const supabase = createRouteHandlerClient(request, authResponse);
  const allowedOtpTypes = ["signup", "invite", "magiclink", "recovery", "email_change", "phone_change"];
  const otpType = allowedOtpTypes.includes(type || "")
    ? (type as "signup" | "invite" | "magiclink" | "recovery" | "email_change")
    : "magiclink";

  const authResult = tokenHash
    ? await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      })
    : await supabase.auth.exchangeCodeForSession(code as string);

  if (authResult.error) {
    redirectToError.searchParams.set("reason", "exchange-failed");
    const response = NextResponse.redirect(redirectToError);
    clearAuthCookies(request, response);
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email;
  if (!email) {
    redirectToError.searchParams.set("reason", "missing-email");
    const response = NextResponse.redirect(redirectToError);
    clearAuthCookies(request, response);
    return response;
  }

  let destination;
  try {
    destination = await resolveAuthIdentityByEmail(email, user?.id);
  } catch (error) {
    if (error instanceof AuthIdentityError) {
      redirectToError.searchParams.set("reason", error.reason);
    } else {
      redirectToError.searchParams.set("reason", "member-lookup-failed");
    }
    const response = NextResponse.redirect(redirectToError);
    clearAuthCookies(request, response);
    return response;
  }

  if (!destination.role) {
    redirectToError.searchParams.set("reason", "identity-not-found");
    redirectToError.searchParams.set("email", email);
    const response = NextResponse.redirect(redirectToError);
    clearAuthCookies(request, response);
    return response;
  }

  const isRecovery = type === "recovery";
  const redirectUrl = isRecovery ? new URL("/reset-password", request.url) : new URL(destination.redirectTo, request.url);
  const response = NextResponse.redirect(redirectUrl);
  copyResponseCookies(authResponse, response);

  response.cookies.set("sb-role", destination.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
