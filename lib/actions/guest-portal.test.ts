import { beforeEach, describe, expect, it, vi } from "vitest";

const guestPortalMocks = vi.hoisted(() => ({
  getRoleCookie: vi.fn(),
  getUser: vi.fn(),
  maybeSingleMember: vi.fn(),
  maybeSingleGuest: vi.fn(),
  selectVisits: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: (name: string) => {
      if (name === "sb-role") {
        return { value: guestPortalMocks.getRoleCookie() };
      }
      return null;
    },
  })),
}));

vi.mock("../supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: guestPortalMocks.getUser,
    },
  })),
}));

vi.mock("./admin-common", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "members") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: guestPortalMocks.maybeSingleMember,
            })),
          })),
        };
      }
      if (table === "guests") {
        return {
          select: vi.fn(() => ({
            ilike: vi.fn(() => ({
              maybeSingle: guestPortalMocks.maybeSingleGuest,
            })),
          })),
        };
      }
      if (table === "guest_visits") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: guestPortalMocks.selectVisits,
            })),
          })),
        };
      }
      return {};
    }),
  })),
  getChapter: vi.fn(() => ({ id: "chapter-1" })),
}));

import { getCurrentGuestContext } from "./guest-portal";

describe("guest portal actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    guestPortalMocks.getUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
    });
  });

  it("returns isPending: true context when user is a pending_member", async () => {
    guestPortalMocks.getRoleCookie.mockReturnValue("pending_member");
    guestPortalMocks.maybeSingleMember.mockResolvedValue({
      data: {
        id: "pm-999",
        chinese_name: "彭待審",
        company_name: "待審公司",
        specialty_title: "顧問",
        email: "test@example.com",
      },
      error: null,
    });

    const context = await getCurrentGuestContext();

    expect(context).toEqual({
      isPending: true,
      guest: {
        id: "pm-999",
        name: "彭待審",
        email: "test@example.com",
        company: "待審公司",
        specialty: "顧問",
      },
      visit: null,
    });
  });

  it("returns isPending: false context when user is a regular guest", async () => {
    guestPortalMocks.getRoleCookie.mockReturnValue("guest");
    guestPortalMocks.maybeSingleGuest.mockResolvedValue({
      data: {
        id: "g-888",
        name: "林來賓",
        email: "test@example.com",
        company: "林記",
        specialty: "餐飲",
        referrer_id: "inviter-1",
        members: { chinese_name: "王小明" },
      },
      error: null,
    });
    guestPortalMocks.selectVisits.mockResolvedValue({
      data: [{ week_date: "2026-06-08", visit_number: 2, status: "confirmed" }],
      error: null,
    });

    const context = await getCurrentGuestContext();

    expect(context).toEqual({
      isPending: false,
      guest: {
        id: "g-888",
        name: "林來賓",
        email: "test@example.com",
        company: "林記",
        specialty: "餐飲",
        referrer_id: "inviter-1",
        members: { chinese_name: "王小明" },
      },
      visit: { week_date: "2026-06-08", visit_number: 2, status: "confirmed" },
    });
  });
});
