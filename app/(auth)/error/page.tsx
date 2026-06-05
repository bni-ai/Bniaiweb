import Link from "next/link";

import { Button } from "../../../components/ui/button";

type ErrorPageProps = {
  searchParams?: Promise<{
    email?: string;
    reason?: string;
  }>;
};

const reasonCopy: Record<string, string> = {
  "member-not-found": "這個會員 Email 尚未出現在會員名冊中。",
  "identity-not-found": "這個 Email 不是正式會員，也不是目前已登記 Email 的受邀來賓。",
  "missing-email": "登入回傳沒有 Email，請改用已驗證 Email 的帳號。",
  "exchange-failed": "登入驗證交換失敗，請重新登入一次。",
  "member-lookup-failed": "會員名冊查詢失敗，請稍後再試。",
  "guest-lookup-failed": "來賓名冊查詢失敗，請稍後再試。",
  "guest-oauth-disabled": "來賓與待審核會員請改用 Email / 密碼或 Magic Link，社群登入僅供正式會員使用。",
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const reason = params?.reason ? reasonCopy[params.reason] : null;
  const email = params?.email;

  return (
    <section>
      <p className="mb-2 text-sm text-text-2">驗證結果</p>
      <h1 className="mb-3 text-2xl font-semibold">您尚未加入華 AI 分會</h1>
      <p className="mb-4 text-sm text-text-2">
        請聯繫幹部協助建立會員或來賓資料，或確認登入 Email 是否與會員名冊、來賓邀約資料一致。
      </p>
      {reason ? <p className="mb-2 rounded-md bg-surface-2 px-3 py-2 text-sm text-text-1">{reason}</p> : null}
      {email ? <p className="mb-4 text-sm text-text-2">登入 Email：{email}</p> : null}
      <p className="mb-6 text-sm text-text-2">聯絡窗口：huaai@bni.com.tw</p>
      <Link href="/login">
        <Button variant="secondary" className="w-full">
          返回登入頁
        </Button>
      </Link>
    </section>
  );
}
