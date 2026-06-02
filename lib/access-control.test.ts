import { describe, expect, it } from "vitest";

import { resolveAccessDecision, resolveAuthDestination, type AppRole } from "./access-control";

describe("access control", () => {
  it.each([
    ["/admin", "admin", null],
    ["/admin/members", "admin", null],
    ["/dashboard", "admin", null],
    ["/dashboard/report", "admin", null],
    ["/guest", "admin", null],
    ["/guest/content", "admin", null],
    ["/admin", "member", "/dashboard"],
    ["/dashboard", "member", null],
    ["/guest", "member", null],
    ["/admin", "guest", "/guest"],
    ["/admin/guests", "guest", "/guest"],
    ["/dashboard", "guest", "/guest"],
    ["/dashboard/report", "guest", "/guest"],
    ["/guest", "guest", null],
    ["/guest/members", "guest", null],
    ["/admin", null, "/login"],
    ["/dashboard", null, "/login"],
  ] satisfies Array<[string, AppRole, string | null]>)("routes %s for role %s", (pathname, role, redirectTo) => {
    expect(resolveAccessDecision(pathname, role).redirectTo ?? null).toBe(redirectTo);
  });

  it("prioritizes formal members before guest identities", () => {
    expect(resolveAuthDestination({ memberRole: "president", isGuest: true })).toEqual({ role: "admin", redirectTo: "/admin" });
    expect(resolveAuthDestination({ memberRole: "member", isGuest: true })).toEqual({ role: "member", redirectTo: "/dashboard" });
    expect(resolveAuthDestination({ memberRole: null, isGuest: true })).toEqual({ role: "guest", redirectTo: "/guest" });
    expect(resolveAuthDestination({ memberRole: null, isGuest: false })).toEqual({ role: null, redirectTo: "/error" });
  });
});
