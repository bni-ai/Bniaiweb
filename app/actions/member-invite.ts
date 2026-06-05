"use server";

import { getChapter, createAdminClient } from "../../lib/actions/admin-common";
import { generateMemberInviteToken, getMemberInviteExpiry } from "../../lib/auth/member-invite";

export async function generateMemberInviteAction(
  previousState: { inviteUrl?: string; error?: string },
  formData: FormData
) {
  void previousState;
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "請先輸入 Email。" };
  }

  await getChapter();
  const supabase = createAdminClient();
  const token = generateMemberInviteToken();
  const expires_at = getMemberInviteExpiry();

  const { error } = await supabase.from("member_invites" as never).insert({
    email,
    token,
    expires_at,
  } as never);

  if (error) {
    return { error: "建立邀請連結失敗，請稍後再試。" };
  }

  return { inviteUrl: `/signup?token=${token}` };
}
