import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const forgotMocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  maybeSingleMember: vi.fn(),
  maybeSingleGuest: vi.fn(),
}));

vi.mock("../../../lib/actions/admin-common", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "members") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: forgotMocks.maybeSingleMember,
            })),
          })),
        };
      }
      if (table === "guests") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: forgotMocks.maybeSingleGuest,
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

vi.mock("../../../lib/supabase/server", () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: forgotMocks.resetPasswordForEmail,
    },
  })),
  clearAuthCookies: vi.fn(),
}));

import { POST } from "./route";

describe("forgot password route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends recovery email successfully if account exists in members", async () => {
    forgotMocks.maybeSingleMember.mockResolvedValue({
      data: { id: "member-1", email: "member@example.com" },
      error: null,
    });
    forgotMocks.resetPasswordForEmail.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "member@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "重設密碼連結已送出，請至信箱收信。",
    });
  });

  it("sends recovery email successfully if account exists in guests", async () => {
    forgotMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    forgotMocks.maybeSingleGuest.mockResolvedValue({
      data: { id: "guest-1", email: "guest@example.com" },
      error: null,
    });
    forgotMocks.resetPasswordForEmail.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "guest@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it("rejects request if email does not exist in either table", async () => {
    forgotMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    forgotMocks.maybeSingleGuest.mockResolvedValue({ data: null, error: null });

    const request = new NextRequest("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "該 Email 尚未註冊。",
    });
  });
});
