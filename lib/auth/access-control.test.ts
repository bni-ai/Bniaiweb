import { describe, expect, it, vi } from "vitest";

import { resolveAccessDecision } from "./access-control";

describe("resolveAccessDecision", () => {
  it("enforces rbac redirects", () => {
    expect(resolveAccessDecision("/dashboard", null)).toEqual({
      allow: false,
      redirectTo: "/login",
    });

    expect(resolveAccessDecision("/admin", "member")).toEqual({
      allow: false,
      redirectTo: "/dashboard",
    });

    expect(resolveAccessDecision("/admin", "admin")).toEqual({
      allow: true,
    });

    expect(resolveAccessDecision("/login", "admin")).toEqual({
      allow: false,
      redirectTo: "/admin",
    });

    expect(resolveAccessDecision("/admin", "pending_member")).toEqual({
      allow: false,
      redirectTo: "/guest",
    });

    expect(resolveAccessDecision("/dashboard", "pending_member")).toEqual({
      allow: false,
      redirectTo: "/guest",
    });

    expect(resolveAccessDecision("/login", "pending_member")).toEqual({
      allow: false,
      redirectTo: "/guest",
    });

    expect(resolveAccessDecision("/guest", "pending_member")).toEqual({
      allow: true,
    });
  });

  it("does not trigger any db query in access control", () => {
    const dbQuerySpy = vi.fn();

    resolveAccessDecision("/dashboard", "member", dbQuerySpy);
    resolveAccessDecision("/admin", "admin", dbQuerySpy);
    resolveAccessDecision("/presentation/2026-06-07", null, dbQuerySpy);
    resolveAccessDecision("/login", "member", dbQuerySpy);

    expect(dbQuerySpy).toHaveBeenCalledTimes(0);
  });
});
