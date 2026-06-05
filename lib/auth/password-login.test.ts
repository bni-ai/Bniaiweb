import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMocks = vi.hoisted(() => ({
  resolveAuthIdentityByEmail: vi.fn(),
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("./identity", () => ({
  AuthIdentityError: class AuthIdentityError extends Error {
    constructor(public readonly reason: string) {
      super(reason);
    }
  },
  resolveAuthIdentityByEmail: authMocks.resolveAuthIdentityByEmail,
}));

vi.mock("../supabase/server", () => ({
  createRouteHandlerClient: vi.fn((_request, response) => ({
    auth: {
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        response.cookies.set("sb-test-auth-token", `${credentials.email}-token`, { path: "/" });
        return authMocks.signInWithPassword(credentials);
      },
      getUser: authMocks.getUser,
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

import { POST } from "../../app/auth/password-login/route";

describe("password login route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists auth cookie and redirects admin members", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: null });
    authMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "admin@example.com",
        },
      },
    });
    authMocks.resolveAuthIdentityByEmail.mockResolvedValue({ role: "admin", redirectTo: "/admin" });

    const request = new NextRequest("http://localhost:3000/auth/password-login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "secret123" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/admin" });
    expect(response.cookies.get("sb-role")?.value).toBe("admin");
    expect(response.cookies.get("sb-test-auth-token")?.value).toBe("admin@example.com-token");
  });

  it("returns readable invalid credential error", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: new Error("Invalid login credentials") });

    const request = new NextRequest("http://localhost:3000/auth/password-login", {
      method: "POST",
      body: JSON.stringify({ email: "member@example.com", password: "wrong" }),
      headers: { "content-type": "application/json", cookie: "sb-role=member" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Email 或密碼錯誤，請再試一次。" });
  });
});
