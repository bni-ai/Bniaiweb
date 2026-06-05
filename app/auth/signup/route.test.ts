import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const signupMocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  maybeSingleMember: vi.fn(),
  maybeSingleGuest: vi.fn(),
  maybeSingleInvite: vi.fn(),
  insertMember: vi.fn(),
  updateInviteEq: vi.fn(),
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
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: signupMocks.insertMember,
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
        };
      }
      if (table === "member_invites") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: signupMocks.maybeSingleInvite,
            })),
          })),
          update: vi.fn(() => ({
            eq: signupMocks.updateInviteEq,
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
  copyResponseCookies: vi.fn((source, target) => {
    for (const cookie of source.cookies.getAll()) {
      target.cookies.set(cookie);
    }
  }),
  clearAuthCookies: vi.fn(),
}));

import { POST } from "./route";

describe("member invite signup route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signupMocks.getChapter.mockResolvedValue({ id: "chapter-123" });
    signupMocks.updateInviteEq.mockResolvedValue({ error: null });
  });

  it("returns 400 when invite token is missing", async () => {
    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "member@example.com",
        password: "securepassword",
        name: "王會員",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "邀請連結無效或已過期。" });
  });

  it("creates a pending_member account when invite token is valid", async () => {
    signupMocks.maybeSingleInvite.mockResolvedValue({
      data: {
        id: "invite-1",
        email: "member@example.com",
        token: "valid-token",
        used_at: null,
        expires_at: "2099-01-01T00:00:00.000Z",
      },
      error: null,
    });
    signupMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    signupMocks.maybeSingleGuest.mockResolvedValue({ data: null, error: null });
    signupMocks.signUp.mockResolvedValue({
      data: { user: { id: "user-999", email: "member@example.com" } },
      error: null,
    });
    signupMocks.insertMember.mockResolvedValue({
      data: { id: "member-999", email: "member@example.com", role: "pending_member" },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        inviteToken: "valid-token",
        email: "member@example.com",
        password: "securepassword",
        name: "王會員",
        company: "會員公司",
        phone: "0912345678",
        specialty: "AI 顧問",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/guest" });
    expect(signupMocks.insertMember).toHaveBeenCalled();
    expect(signupMocks.updateInviteEq).toHaveBeenCalled();
    expect(response.cookies.get("sb-role")?.value).toBe("pending_member");
  });

  it("rejects signup when invite token has already been used", async () => {
    signupMocks.maybeSingleInvite.mockResolvedValue({
      data: {
        id: "invite-2",
        email: "member@example.com",
        token: "used-token",
        used_at: "2026-06-01T00:00:00.000Z",
        expires_at: "2099-01-01T00:00:00.000Z",
      },
      error: null,
    });

    const request = new NextRequest("http://localhost:3000/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        inviteToken: "used-token",
        email: "member@example.com",
        password: "securepassword",
        name: "王會員",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "邀請連結無效或已過期。" });
  });
});
