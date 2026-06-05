import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getChapter } from "../../../lib/actions/admin-common";
import { isMemberInviteValid } from "../../../lib/auth/member-invite";
import { copyResponseCookies, createRouteHandlerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { inviteToken, email, password, name, company, phone, specialty } = await request.json();

    if (!inviteToken || !email || !password || !name) {
      return NextResponse.json(
        { error: "邀請連結無效或已過期。" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { data: inviteData, error: inviteError } = await adminClient
      .from("member_invites" as never)
      .select("id, email, token, used_at, expires_at")
      .eq("token", inviteToken as never)
      .maybeSingle();
    const invite = inviteData as { id: string; email: string; token: string; used_at: string | null; expires_at: string } | null;

    if (inviteError || !isMemberInviteValid(invite, email)) {
      return NextResponse.json(
        { error: "邀請連結無效或已過期。" },
        { status: 400 }
      );
    }
    if (!invite) {
      return NextResponse.json(
        { error: "邀請連結無效或已過期。" },
        { status: 400 }
      );
    }

    const { data: existingMember, error: memberError } = await adminClient
      .from("members" as never)
      .select("id")
      .ilike("email", email as never)
      .maybeSingle();

    if (memberError) {
      return NextResponse.json(
        { error: "檢查會員資料失敗，請稍後再試。" },
        { status: 500 }
      );
    }

    if (existingMember) {
      return NextResponse.json(
        { error: "該 Email 已被註冊，請直接登入。" },
        { status: 400 }
      );
    }

    const { data: existingGuest, error: guestError } = await adminClient
      .from("guests" as never)
      .select("id")
      .ilike("email", email as never)
      .maybeSingle();

    if (guestError) {
      return NextResponse.json(
        { error: "檢查來賓資料失敗，請稍後再試。" },
        { status: 500 }
      );
    }

    if (existingGuest) {
      return NextResponse.json(
        { error: "該 Email 已被註冊，請直接登入。" },
        { status: 400 }
      );
    }

    const response = NextResponse.next();
    const supabase = createRouteHandlerClient(request, response);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !signUpData.user) {
      return NextResponse.json(
        { error: signUpError?.message || "註冊失敗，請稍後再試。" },
        { status: 400 }
      );
    }

    const chapter = await getChapter();

    const { error: insertError } = await adminClient
      .from("members" as never)
      .insert({
        chapter_id: chapter.id,
        auth_uid: signUpData.user.id,
        email,
        chinese_name: name,
        line_name: phone || null,
        company_name: company || null,
        specialty_title: specialty || null,
        role: "pending_member",
        is_active: true,
      } as never)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "建立會員申請資料失敗，請聯絡管理員。" },
        { status: 500 }
      );
    }

    const { error: updateInviteError } = await adminClient
      .from("member_invites" as never)
      .update({ used_at: new Date().toISOString() } as never)
      .eq("id", invite.id as never);

    if (updateInviteError) {
      return NextResponse.json(
        { error: "更新邀請狀態失敗，請聯絡管理員。" },
        { status: 500 }
      );
    }

    const redirectResponse = NextResponse.json({ redirectTo: "/guest" });
    copyResponseCookies(response, redirectResponse);
    redirectResponse.cookies.set("sb-role", "pending_member", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return redirectResponse;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "發生未知錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
