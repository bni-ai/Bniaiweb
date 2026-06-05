import Link from "next/link";

import { MemberSignupForm } from "../../../components/auth/member-signup-form";
import { Button } from "../../../components/ui/button";
import { createAdminClient } from "../../../lib/actions/admin-common";
import { isMemberInviteValid } from "../../../lib/auth/member-invite";

type SignupPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const token = params?.token?.trim();

  if (!token) {
    return <MemberInviteBlockedState />;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("member_invites" as never)
    .select("id, email, token, used_at, expires_at")
    .eq("token", token as never)
    .maybeSingle();
  const invite = data as { id: string; email: string; token: string; used_at: string | null; expires_at: string } | null;

  if (error || !isMemberInviteValid(invite)) {
    return <MemberInviteBlockedState />;
  }
  if (!invite) {
    return <MemberInviteBlockedState />;
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">BNI 華 AI 分會</p>
        <h1 className="text-2xl font-semibold text-text-1">受邀會員註冊</h1>
        <p className="mt-2 text-sm text-text-2">這個頁面僅供已收到分會邀請連結的會員建立帳號。完成後帳號會先進入待審核狀態。</p>
      </div>

      <MemberSignupForm inviteToken={token} defaultEmail={invite.email} />
    </section>
  );
}

function MemberInviteBlockedState() {
  return (
    <section className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">BNI 華 AI 分會</p>
        <h1 className="text-2xl font-semibold text-text-1">此頁面僅供受邀者使用</h1>
        <p className="mt-2 text-sm text-text-2">正式會員註冊採邀請制。若您是來賓，請改走來賓註冊入口；若您尚未收到會員邀請連結，請聯繫幹部協助。</p>
      </div>

      <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-4">
        <Link href="/guest/register" id="signup-link">
          <Button className="w-full">註冊來賓帳號</Button>
        </Link>
        <Link href="/login">
          <Button className="w-full" variant="secondary">
            返回登入
          </Button>
        </Link>
      </div>
    </section>
  );
}
