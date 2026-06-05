"use client";

import { type FormEvent, useState } from "react";

import { Button } from "../ui/button";

export function GuestSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/auth/guest-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          company: company || undefined,
          phone: phone || undefined,
          specialty: specialty || undefined,
        }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; redirectTo?: string } | null;
      if (!response.ok || !body?.redirectTo) {
        setError(body?.error || "註冊失敗，請稍後再試。");
        setLoading(false);
        return;
      }

      window.location.assign(body.redirectTo);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "註冊初始化失敗，請稍後再試。");
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSignup}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-1" htmlFor="name">
            姓名 <span className="text-primary">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="您的姓名"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-1" htmlFor="phone">
            聯絡電話
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="0912-345-678"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-1" htmlFor="email">
          Email <span className="text-primary">*</span>
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

      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-1" htmlFor="password">
          密碼 (至少 6 位字元) <span className="text-primary">*</span>
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
          placeholder="請設定登入密碼"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-1" htmlFor="company">
            公司名稱
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="您的公司"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-1" htmlFor="specialty">
            專業領域
          </label>
          <input
            id="specialty"
            type="text"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="例如：室內設計"
          />
        </div>
      </div>

      <Button className="mt-2 w-full" type="submit" disabled={loading}>
        {loading ? "註冊中..." : "註冊來賓帳號"}
      </Button>

      <div className="text-center text-xs">
        已經有帳號？{" "}
        <a href="/login" id="login-link" className="font-medium text-text-2 hover:underline">
          立即登入
        </a>
      </div>

      {error ? (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          {error}
        </p>
      ) : null}
    </form>
  );
}

