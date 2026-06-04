"use client";

import { type FormEvent, useState } from "react";
import { Button } from "../../../components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致。");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!response.ok) {
        setError(body?.error || "重設密碼失敗，請稍後再試。");
        setLoading(false);
        return;
      }

      setMessage(body?.message || "密碼已重設成功，請重新登入。");
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
        <h1 className="text-2xl font-semibold text-text-1">重設密碼</h1>
        <p className="mt-2 text-sm text-text-2">請設定您的新密碼，密碼長度需至少為 6 個字元。</p>
      </div>

      {!message ? (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-1" htmlFor="password">
              新密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="請輸入新密碼"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-1" htmlFor="confirm-password">
              確認新密碼
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="請再次輸入新密碼"
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "更新中..." : "重設密碼"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-surface-2 px-3 py-3 text-sm text-text-1">
            {message}
          </div>
          <Button className="w-full" onClick={() => window.location.assign("/login")}>
            前往登入
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
