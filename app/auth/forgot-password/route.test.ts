import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const forgotMocks = vi.hoisted(() => ({
  maybeSingleMember: vi.fn(),
  maybeSingleGuest: vi.fn(),
  ensureAuthUserByEmail: vi.fn(),
  generateLink: vi.fn(),
  buildAuthActionLink: vi.fn(),
  sendAuthActionEmail: vi.fn(),
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

vi.mock("../../../lib/auth/action-email", () => ({
  createAuthAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        generateLink: forgotMocks.generateLink,
      },
    },
  })),
  ensureAuthUserByEmail: forgotMocks.ensureAuthUserByEmail,
  buildAuthActionLink: forgotMocks.buildAuthActionLink,
  sendAuthActionEmail: forgotMocks.sendAuthActionEmail,
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
    forgotMocks.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: "recovery-hash" } },
      error: null,
    });
    forgotMocks.buildAuthActionLink.mockReturnValue("http://localhost:3000/auth/callback?token_hash=recovery-hash&type=recovery");

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
    expect(forgotMocks.ensureAuthUserByEmail).toHaveBeenCalledWith(expect.anything(), "member@example.com");
    expect(forgotMocks.generateLink).toHaveBeenCalledWith({
      type: "recovery",
      email: "member@example.com",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
    expect(forgotMocks.sendAuthActionEmail).toHaveBeenCalledWith({
      email: "member@example.com",
      subject: "BNI 華 AI 分會密碼重設連結",
      heading: "重設您的 BNI 華 AI 分會密碼",
      intro: "我們收到您重設密碼的請求，請點擊下方按鈕設定新密碼。",
      buttonLabel: "設定新密碼",
      actionLink: "http://localhost:3000/auth/callback?token_hash=recovery-hash&type=recovery",
    });
  });

  it("sends recovery email successfully if account exists in guests", async () => {
    forgotMocks.maybeSingleMember.mockResolvedValue({ data: null, error: null });
    forgotMocks.maybeSingleGuest.mockResolvedValue({
      data: { id: "guest-1", email: "guest@example.com" },
      error: null,
    });
    forgotMocks.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: "guest-recovery-hash" } },
      error: null,
    });
    forgotMocks.buildAuthActionLink.mockReturnValue("http://localhost:3000/auth/callback?token_hash=guest-recovery-hash&type=recovery");

    const request = new NextRequest("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "guest@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(forgotMocks.ensureAuthUserByEmail).toHaveBeenCalledWith(expect.anything(), "guest@example.com");
  });

  it("returns error when recovery link generation fails", async () => {
    forgotMocks.maybeSingleMember.mockResolvedValue({
      data: { id: "member-1", email: "member@example.com" },
      error: null,
    });
    forgotMocks.generateLink.mockResolvedValue({
      data: { properties: null },
      error: new Error("generate link failed"),
    });

    const request = new NextRequest("http://localhost:3000/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "member@example.com" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "無法建立密碼重設連結，請稍後再試。",
    });
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
