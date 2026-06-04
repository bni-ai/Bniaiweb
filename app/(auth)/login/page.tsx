"use client";

import { type FormEvent, useState } from "react";

import { Button } from "../../../components/ui/button";
import { getReadableAuthErrorMessage, isGithubOauthEnabled, type LoginMode } from "../../../lib/auth/login";
import { createBrowserClient } from "../../../lib/supabase/client";

type OAuthProvider = "google" | "github";

const githubEnabled = isGithubOauthEnabled();

function GoogleIcon() {
  return (
    <svg viewBox="0 0 488 512" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 496 512" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4-70 15-84.7-29.8-84.7-29.8-11.4-29.1-27.8-36.6-27.8-36.6-22.9-15.7 1.6-15.4 1.6-15.4 24.9 2 38.6 25.8 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<LoginMode>("password");
  const [loadingProvider, setLoadingProvider] = useState<"password" | "email-link" | OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleOAuthLogin(provider: OAuthProvider) {
    setLoadingProvider(provider);
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserClient();

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (signInError) {
        setError(getReadableAuthErrorMessage("社群登入失敗，請稍後再試。", signInError));
        setLoadingProvider(null);
        return;
      }

      if (!data.url) {
        setError("無法取得登入導向網址，請重新整理後再試一次。");
        setLoadingProvider(null);
        return;
      }

      window.location.assign(data.url);
    } catch (caughtError) {
      setError(getReadableAuthErrorMessage("社群登入初始化失敗，請稍後再試。", caughtError));
      setLoadingProvider(null);
    }
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingProvider(mode === "password" ? "password" : "email-link");
    setError(null);
    setMessage(null);

    if (mode === "password") {
      const response = await fetch("/auth/password-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const body = (await response.json().catch(() => null)) as { error?: string; redirectTo?: string } | null;
      if (!response.ok || !body?.redirectTo) {
        setError(body?.error || "登入失敗，請確認 Email 與密碼。");
        setLoadingProvider(null);
        return;
      }

      window.location.assign(body.redirectTo);
      return;
    }

    const response = await fetch("/auth/email-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "登入連結寄送失敗，請稍後再試。");
      setLoadingProvider(null);
      return;
    }

    setMessage("登入連結已送出，請到信箱收信。");
    setLoadingProvider(null);
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="mb-2 text-sm text-text-2">BNI 華 AI 分會</p>
        <h1 className="text-2xl font-semibold text-text-1">會員登入</h1>
        <p className="mt-2 text-sm text-text-2">使用分會名冊內的會員 Email 登入會員系統。</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-card)] bg-surface-2 p-1">
        <button
          type="button"
          className={`rounded-[var(--radius-input)] px-3 py-2 text-sm font-medium transition ${mode === "password" ? "bg-white text-text-1 shadow-sm" : "text-text-2"}`}
          onClick={() => setMode("password")}
        >
          密碼登入
        </button>
        <button
          type="button"
          className={`rounded-[var(--radius-input)] px-3 py-2 text-sm font-medium transition ${mode === "magic-link" ? "bg-white text-text-1 shadow-sm" : "text-text-2"}`}
          onClick={() => setMode("magic-link")}
        >
          Magic Link
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleEmailLogin}>
        <label className="block text-sm font-medium text-text-1" htmlFor="email">
          會員 Email
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
        {mode === "password" ? (
          <>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-text-1" htmlFor="password">
                密碼
              </label>
              <a href="/forgot-password" id="forgot-password-link" className="text-xs text-text-2 hover:underline">
                忘記密碼？
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-[var(--radius-input)] border border-border bg-surface px-3 py-2 text-sm text-text-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="請輸入密碼"
            />
          </>
        ) : null}
        <Button className="w-full" type="submit" disabled={loadingProvider !== null}>
          {mode === "password"
            ? loadingProvider === "password"
              ? "登入中..."
              : "登入"
            : loadingProvider === "email-link"
              ? "寄送中..."
              : "寄送登入連結"}
        </Button>
        <div className="text-center text-xs">
          沒有帳號？{" "}
          <a href="/signup" id="signup-link" className="font-medium text-text-2 hover:underline">
            註冊來賓帳號
          </a>
        </div>
      </form>

      <div className="relative">
        <div className="h-px bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-xs font-medium text-text-2">
          或使用社群帳號
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="gap-2"
          variant="secondary"
          onClick={() => handleOAuthLogin("google")}
          disabled={loadingProvider !== null}
        >
          <GoogleIcon />
          {loadingProvider === "google" ? "登入中..." : "Google"}
        </Button>
        {githubEnabled ? (
          <Button
            className="gap-2"
            variant="secondary"
            onClick={() => handleOAuthLogin("github")}
            disabled={loadingProvider !== null}
          >
            <GithubIcon />
            {loadingProvider === "github" ? "登入中..." : "GitHub"}
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-1">{message}</p>
      ) : null}
      {error ? <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">{error}</p> : null}

      <p className="text-xs leading-5 text-text-2">
        登入後會比對 `members.email` / `guests.email`。如果名冊還沒有你的 email，系統會導向未加入分會頁面。
      </p>
    </section>
  );
}
