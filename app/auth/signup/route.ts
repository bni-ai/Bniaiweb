import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, getChapter } from "../../../lib/actions/admin-common";
import { createRouteHandlerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, company, phone, specialty } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "請填寫 Email、密碼與姓名。" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 檢查 members 是否已存在該 email
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

    // 檢查 guests 是否已存在該 email
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

    // 進行 Supabase Auth 註冊
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

    // 寫入 guests 資料表
    const { error: insertError } = await adminClient
      .from("guests" as never)
      .insert({
        id: signUpData.user.id,
        chapter_id: chapter.id,
        name,
        email,
        company: company || null,
        phone: phone || null,
        specialty: specialty || null,
      } as never)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "建立來賓資料失敗，請聯絡管理員。" },
        { status: 500 }
      );
    }

    // 設定 cookie 並回傳 redirect 目的地
    const redirectResponse = NextResponse.json({ redirectTo: "/guest" });
    redirectResponse.cookies.set("sb-role", "guest", {
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
