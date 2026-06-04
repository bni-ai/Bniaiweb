import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const signupMocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  getUser: vi.fn(),
  maybeSingleMember: vi.fn(),
  maybeSingleGuest: vi.fn(),
  insertGuest: vi.fn(),
  getChapter: vi.fn(),
}));

vi.mock("../../../lib/actions/admin-common", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "members") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: signupMocks.maybeSingleMember,
            })),
          })),
        };
      }
      if (table === "guests") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: signupMocks.maybeSingleGuest,
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: signupMocks.insertGuest,
            })),
          })),
        };
      }
      return {};
    }),
  })),
  getChapter: signupMocks.getChapter,
}));

vi.mock("../../../lib/supabase/server", () => ({
  createRouteHandlerClient: vi.fn((_request: unknown, response: { cookies: { set: (name: string, value: string, options?: unknown) => void } }) => ({
    auth: {
      signUp: async (credentials: { email: string }) => {
        response.cookies.set("sb-test-auth-token", `${credentials.email}-token`, { path: "/" });
        return signupMocks.signUp(credentials);
      },
    },
  })),
  clearAuthCookies: vi.fn(),
}));

import { POST } from "./route";

describe("signup route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signupMocks.getChapter.mockResolvedValue({ id: "chapter-123" });
  });

  it("registers a guest successfully when inputs are valid and email is unique", async () => {
    signupMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    signupMocks.maybeSingleGuest.mockResolvedValue({ data: null, error: null });
    signupMocks.signUp.mockResolvedValue({
      data: { user: { id: "user-999", email: "newguest@example.com" } },
      error: null,
    });
    signupMocks.insertGuest.mockResolvedValue({
      data: { id: "guest-999", email: "newguest@example.com" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "newguest@example.com",
        password: "securepassword",
        name: "李來賓",
        company: "來賓有限公司",
        phone: "0912345678",
        specialty: "軟體開發",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/guest" });
    expect(response.cookies.get("sb-role")?.value).toBe("guest");
  });

  it("rejects signup when email is already registered in members", async () => {
    signupMocks.maybeSingleMember.mockResolvedValue({
      data: { id: "member-1", email: "member@example.com" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "member@example.com",
        password: "securepassword",
        name: "李來賓",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "該 Email 已被註冊，請直接登入。" });
  });

  it("rejects signup when email is already registered in guests", async () => {
    signupMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    signupMocks.maybeSingleGuest.mockResolvedValue({
      data: { id: "guest-1", email: "guest@example.com" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "guest@example.com",
        password: "securepassword",
        name: "李來賓",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "該 Email 已被註冊，請直接登入。" });
  });
});
