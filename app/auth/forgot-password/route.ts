import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/actions/admin-common";
import { createRouteHandlerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "請輸入 Email。" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 檢查 members
    const { data: member, error: memberError } = await adminClient
      .from("members" as never)
      .select("id")
      .ilike("email", email as never)
      .maybeSingle();

    if (memberError) {
      return NextResponse.json({ error: "檢查會員資料失敗，請稍後再試。" }, { status: 500 });
    }

    let accountExists = Boolean(member);

    // 如果 members 不存在，檢查 guests
    if (!accountExists) {
      const { data: guest, error: guestError } = await adminClient
        .from("guests" as never)
        .select("id")
        .ilike("email", email as never)
        .maybeSingle();

      if (guestError) {
        return NextResponse.json({ error: "檢查來賓資料失敗，請稍後再試。" }, { status: 500 });
      }

      accountExists = Boolean(guest);
    }

    if (!accountExists) {
      return NextResponse.json({ error: "該 Email 尚未註冊。" }, { status: 400 });
    }

    // 發送重設密碼信件
    const response = NextResponse.next();
    const supabase = createRouteHandlerClient(request, response);
    const requestUrl = new URL(request.url);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${requestUrl.origin}/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "重設密碼連結已送出，請至信箱收信。" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "發生未知錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
