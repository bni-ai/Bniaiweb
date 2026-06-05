import { beforeEach, describe, expect, it, vi } from "vitest";

const inviteActionMocks = vi.hoisted(() => ({
  insertInvite: vi.fn(),
  getChapter: vi.fn(),
}));

vi.mock("../../lib/actions/admin-common", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "member_invites") {
        return {
          insert: vi.fn((data: unknown) => {
            inviteActionMocks.insertInvite(data);
            return { error: null };
          }),
        };
      }
      return {};
    }),
  })),
  getChapter: inviteActionMocks.getChapter,
}));

import { generateMemberInviteAction } from "./member-invite";

describe("generateMemberInviteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inviteActionMocks.getChapter.mockResolvedValue({ id: "chapter-123" });
  });

  it("returns error when email is missing", async () => {
    const formData = new FormData();
    const result = await generateMemberInviteAction({}, formData);
    expect(result).toEqual({ error: "請先輸入 Email。" });
  });

  it("creates an invite row and returns signup url", async () => {
    const formData = new FormData();
    formData.set("email", "member@example.com");

    const result = await generateMemberInviteAction({}, formData);

    expect(inviteActionMocks.insertInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "member@example.com",
      })
    );
    expect(inviteActionMocks.insertInvite.mock.calls[0]?.[0]?.token).toMatch(/^[a-f0-9]{64}$/);
    expect(result.inviteUrl).toMatch(/^\/signup\?token=[a-f0-9]{64}$/);
  });
});
