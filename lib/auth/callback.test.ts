import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const callbackMocks = vi.hoisted(() => ({
  resolveAuthIdentityByEmail: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
  getUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("./identity", () => ({
  AuthIdentityError: class AuthIdentityError extends Error {
    constructor(public readonly reason: string) {
      super(reason);
    }
  },
  resolveAuthIdentityByEmail: callbackMocks.resolveAuthIdentityByEmail,
}));

vi.mock("../supabase/server", () => ({
  createRouteHandlerClient: vi.fn((_request, response) => ({
    auth: {
      exchangeCodeForSession: async (code: string) => {
        response.cookies.set("sb-test-auth-token", `code-${code}`, { path: "/" });
        return callbackMocks.exchangeCodeForSession(code);
      },
      verifyOtp: async (payload: { token_hash: string; type: string }) => {
        response.cookies.set("sb-test-auth-token", `otp-${payload.token_hash}`, { path: "/" });
        return callbackMocks.verifyOtp(payload);
      },
      getUser: callbackMocks.getUser,
      signOut: callbackMocks.signOut,
    },
  })),
  copyResponseCookies: vi.fn((source, target) => {
    for (const cookie of source.cookies.getAll()) {
      target.cookies.set(cookie);
    }
  }),
  clearAuthCookies: vi.fn((request, response) => {
    for (const cookie of request.cookies.getAll()) {
      response.cookies.delete(cookie.name);
    }
  }),
}));

import { GET as callbackGet } from "../../app/auth/callback/route";
import { POST as logoutPost } from "../../app/auth/logout/route";

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks guest users from completing OAuth login", async () => {
    callbackMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    callbackMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-2",
          email: "guest@example.com",
        },
      },
    });
    callbackMocks.resolveAuthIdentityByEmail.mockResolvedValue({ role: "guest", redirectTo: "/guest" });

    const request = new NextRequest("http://localhost:3000/auth/callback?code=test-code");
    const response = await callbackGet(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/error?reason=guest-oauth-disabled");
  });

  it("blocks pending_member users from completing OAuth login", async () => {
    callbackMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    callbackMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-3",
          email: "pending@example.com",
        },
      },
    });
    callbackMocks.resolveAuthIdentityByEmail.mockResolvedValue({ role: "pending_member", redirectTo: "/guest" });

    const request = new NextRequest("http://localhost:3000/auth/callback?code=pending-code");
    const response = await callbackGet(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/error?reason=guest-oauth-disabled");
  });

  it("redirects to error page when identity cannot be resolved", async () => {
    callbackMocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    callbackMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-4",
          email: "unknown@example.com",
        },
      },
    });
    callbackMocks.resolveAuthIdentityByEmail.mockResolvedValue({ role: null, redirectTo: "/error" });

    const request = new NextRequest("http://localhost:3000/auth/callback?code=unknown-code");
    const response = await callbackGet(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/error?reason=identity-not-found&email=unknown%40example.com");
  });

  it("handles recovery verification and redirects to /reset-password", async () => {
    callbackMocks.verifyOtp.mockResolvedValue({ error: null });
    callbackMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-5",
          email: "member@example.com",
        },
      },
    });
    callbackMocks.resolveAuthIdentityByEmail.mockResolvedValue({ role: "member", redirectTo: "/dashboard" });

    const request = new NextRequest("http://localhost:3000/auth/callback?token_hash=recovery-token&type=recovery");
    const response = await callbackGet(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/reset-password");
    expect(response.cookies.get("sb-role")?.value).toBe("member");
  });
});

describe("logout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears role and auth cookies even when signOut fails", async () => {
    callbackMocks.signOut.mockRejectedValue(new Error("network"));

    const request = new NextRequest("http://localhost:3000/auth/logout", {
      method: "POST",
      headers: {
        cookie: "sb-role=admin; sb-test-auth-token=token",
      },
    });

    const response = await logoutPost(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    const setCookie = response.headers.get("set-cookie") || "";
    expect(setCookie).toContain("sb-role=;");
    expect(setCookie).toContain("sb-test-auth-token=;");
  });
});
