import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const resetMocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("../../../lib/supabase/server", () => ({
  createRouteHandlerClient: vi.fn(() => ({
    auth: {
      updateUser: resetMocks.updateUser,
      signOut: resetMocks.signOut,
    },
  })),
  clearAuthCookies: vi.fn(),
}));

import { POST } from "./route";

describe("reset password route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates user password successfully and clears session", async () => {
    resetMocks.updateUser.mockResolvedValue({ error: null });
    resetMocks.signOut.mockResolvedValue({ error: null });

    const request = new NextRequest("http://localhost:3000/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "newsecurepassword123" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "密碼重設成功，請使用新密碼登入。",
    });
  });

  it("returns error if password is less than 6 characters", async () => {
    const request = new NextRequest("http://localhost:3000/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "123" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "密碼長度必須至少為 6 個字元。",
    });
  });

  it("returns error if update password API call fails", async () => {
    resetMocks.updateUser.mockResolvedValue({
      error: new Error("Auth session expired"),
    });

    const request = new NextRequest("http://localhost:3000/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "validnewpassword" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Auth session expired",
    });
  });
});
