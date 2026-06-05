import { GuestSignupForm } from "../../../../components/auth/guest-signup-form";

export default function GuestRegisterPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">BNI 華 AI 分會</p>
        <h1 className="text-3xl font-black text-text-1">註冊來賓帳號</h1>
        <p className="mt-2 text-sm leading-6 text-text-2">
          建立來賓帳號後，您可以登入查看分會介紹、參訪準備、邀約資訊與會後回饋入口。
        </p>
      </div>

      <GuestSignupForm />
    </div>
  );
}
