"use client";

import { type FormEvent, useState } from "react";
import { Button } from "../../../components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!response.ok) {
        setError(body?.error || "發送失敗，請稍後再試。");
        setLoading(false);
        return;
      }

      setMessage(body?.message || "重設密碼連結已送出，請至信箱收信。");
      setLoading(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "發生未知錯誤，請稍後再試。");
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">BNI 華 AI 分會</p>
        <h1 className="text-2xl font-semibold text-text-1">忘記密碼</h1>
        <p className="mt-2 text-sm text-text-2">輸入您註冊的 Email，系統將發送重設密碼連結至您的信箱。</p>
      </div>

      {!message ? (
        <form className="space-y-4" onSubmit={handleResetRequest}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-1" htmlFor="email">
              註冊 Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "寄送中..." : "寄送重設密碼連結"}
          </Button>

          <div className="text-center text-xs">
            <a href="/login" id="back-to-login" className="font-medium text-text-2 hover:underline">
              返回登入
            </a>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface-2 px-3 py-3 text-sm text-text-1">
            {message}
          </div>
          <Button className="w-full" onClick={() => window.location.assign("/login")}>
            返回登入
          </Button>
        </div>
      )}

      {error ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          {error}
        </p>
      ) : null}
    </section>
  );
}
