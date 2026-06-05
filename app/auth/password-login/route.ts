import { NextRequest, NextResponse } from "next/server";

import { AuthIdentityError, resolveAuthIdentityByEmail } from "../../../lib/auth/identity";
import { clearAuthCookies, copyResponseCookies, createRouteHandlerClient } from "../../../lib/supabase/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = body.email?.trim().toLowerCase() || "";
  const password = body.password?.trim() || "";

  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "請輸入有效的 Email 與密碼。" }, { status: 400 });
  }

  const authResponse = NextResponse.next();
  const supabase = createRouteHandlerClient(request, authResponse);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const response = NextResponse.json({ error: "Email 或密碼錯誤，請再試一次。" }, { status: 400 });
    clearAuthCookies(request, response);
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    const response = NextResponse.json({ error: "登入成功但找不到使用者 Email。" }, { status: 500 });
    clearAuthCookies(request, response);
    return response;
  }

  let destination;
  try {
    destination = await resolveAuthIdentityByEmail(user.email, user.id);
  } catch (caughtError) {
    const reason = caughtError instanceof AuthIdentityError ? caughtError.reason : "member-lookup-failed";
    const response = NextResponse.json({ error: reason }, { status: 500 });
    clearAuthCookies(request, response);
    return response;
  }

  if (!destination.role) {
    const response = NextResponse.json({ error: "這個 Email 目前不在會員或來賓名單中。" }, { status: 403 });
    clearAuthCookies(request, response);
    return response;
  }

  const response = NextResponse.json({ redirectTo: destination.redirectTo });
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
