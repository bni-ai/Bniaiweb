import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const guestSignupMocks = vi.hoisted(() => ({
  signUp: vi.fn(),
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
              maybeSingle: guestSignupMocks.maybeSingleMember,
            })),
          })),
        };
      }
      if (table === "guests") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: guestSignupMocks.maybeSingleGuest,
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: guestSignupMocks.insertGuest,
            })),
          })),
        };
      }
      return {};
    }),
  })),
  getChapter: guestSignupMocks.getChapter,
}));

vi.mock("../../../lib/supabase/server", () => ({
  createRouteHandlerClient: vi.fn((_request: unknown, response: { cookies: { set: (name: string, value: string, options?: unknown) => void } }) => ({
    auth: {
      signUp: async (credentials: { email: string }) => {
        response.cookies.set("sb-test-auth-token", `${credentials.email}-token`, { path: "/" });
        return guestSignupMocks.signUp(credentials);
      },
    },
  })),
  copyResponseCookies: vi.fn((source, target) => {
    for (const cookie of source.cookies.getAll()) {
      target.cookies.set(cookie);
    }
  }),
  clearAuthCookies: vi.fn(),
}));

import { POST } from "./route";

describe("guest signup route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    guestSignupMocks.getChapter.mockResolvedValue({ id: "chapter-123" });
  });

  it("registers a guest successfully when inputs are valid and email is unique", async () => {
    guestSignupMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    guestSignupMocks.maybeSingleGuest.mockResolvedValue({ data: null, error: null });
    guestSignupMocks.signUp.mockResolvedValue({
      data: { user: { id: "user-999", email: "newguest@example.com" } },
      error: null,
    });
    guestSignupMocks.insertGuest.mockResolvedValue({
      data: { id: "guest-999", email: "newguest@example.com" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/guest-signup", {
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
    guestSignupMocks.maybeSingleMember.mockResolvedValue({
      data: { id: "member-1", email: "member@example.com" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/guest-signup", {
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
});
