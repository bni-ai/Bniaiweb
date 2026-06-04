import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, createRouteHandlerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "密碼長度必須至少為 6 個字元。" },
        { status: 400 }
      );
    }

    const response = NextResponse.next();
    const supabase = createRouteHandlerClient(request, response);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // 重設密碼後強制登出，要求重新登入
    await supabase.auth.signOut();
    const successResponse = NextResponse.json({
      message: "密碼重設成功，請使用新密碼登入。",
    });
    clearAuthCookies(request, successResponse);

    return successResponse;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "發生未知錯誤，請稍後再試。" },
      { status: 500 }
    );
  }
}
