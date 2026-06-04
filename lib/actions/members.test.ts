import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  updateMember: vi.fn(),
  selectGuest: vi.fn(),
  insertMember: vi.fn(),
  deleteGuest: vi.fn(),
  getChapter: vi.fn(),
}));

vi.mock("./admin-common", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "members") {
        const eqMock = vi.fn(() => ({ eq: eqMock, error: null }));
        return {
          update: vi.fn((data: unknown) => {
            actionMocks.updateMember(data);
            return { eq: eqMock };
          }),
          insert: vi.fn((data: unknown) => {
            actionMocks.insertMember(data);
            return { error: null };
          }),
        };
      }
      if (table === "guests") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: actionMocks.selectGuest,
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => {
              actionMocks.deleteGuest();
              return { error: null };
            }),
          })),
        };
      }
      return {};
    }),
  })),
  getChapter: actionMocks.getChapter,
  requireText: vi.fn((formData: FormData, name: string) => {
    return formData.get(name) as string || "";
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { approvePendingMemberAction, promoteGuestToMemberAction } from "./members";

describe("admin member approval actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actionMocks.getChapter.mockResolvedValue({ id: "chapter-123" });
  });

  it("approves pending member successfully", async () => {
    const formData = new FormData();
    formData.set("id", "member-999");
    formData.set("role", "member");

    await approvePendingMemberAction(formData);

    expect(actionMocks.updateMember).toHaveBeenCalledWith({
      role: "member",
      is_active: true,
    });
  });

  it("promotes guest to member successfully and removes guest record", async () => {
    actionMocks.selectGuest.mockResolvedValue({
      data: {
        id: "guest-555",
        name: "張來賓",
        email: "guest555@example.com",
        company: "來賓行",
        specialty: "餐飲",
      },
      error: null,
    });

    const formData = new FormData();
    formData.set("guest_id", "guest-555");
    formData.set("role", "officer");

    await promoteGuestToMemberAction(formData);

    expect(actionMocks.insertMember).toHaveBeenCalledWith({
      chapter_id: "chapter-123",
      auth_uid: "guest-555",
      email: "guest555@example.com",
      chinese_name: "張來賓",
      company_name: "來賓行",
      specialty_title: "餐飲",
      role: "officer",
      is_active: true,
    });
    expect(actionMocks.deleteGuest).toHaveBeenCalled();
  });

  it("throws error for invalid parameters", async () => {
    const formData = new FormData();
    formData.set("id", "member-999");
    formData.set("role", "invalid_role");

    await expect(approvePendingMemberAction(formData)).rejects.toThrow();
  });
});
