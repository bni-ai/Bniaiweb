import { describe, expect, it } from "vitest";

import { buildShellIdentity, getInitial } from "./shell-identity";

describe("shell identity", () => {
  it("prefers member profile name and metadata", () => {
    const identity = buildShellIdentity({
      role: "admin",
      email: "fish@fishot.com",
      member: {
        chinese_name: "余啟彰",
        email: "fish@fishot.com",
        member_number: "001",
        photo_url: "https://example.com/avatar.png",
        position: "主席",
        role: "president",
        specialty_title: "AI 顧問",
      },
    });

    expect(identity.displayName).toBe("余啟彰");
    expect(identity.secondaryLabel).toBe("主席 · 001");
    expect(identity.avatarUrl).toBe("https://example.com/avatar.png");
    expect(identity.initial).toBe("彰");
    expect(identity.roleLabel).toBe("管理員");
  });

  it("falls back to session role and email when member profile is missing", () => {
    const identity = buildShellIdentity({
      role: "admin",
      email: "admin@example.com",
      member: null,
    });

    expect(identity.displayName).toBe("admin@example.com");
    expect(identity.secondaryLabel).toBe("管理員 · 尚未連結會員資料");
    expect(identity.initial).toBe("A");
  });

  it("builds stable initials for Chinese and email values", () => {
    expect(getInitial("余啟銘")).toBe("銘");
    expect(getInitial("fish.myfb@gmail.com")).toBe("F");
    expect(getInitial("")).toBe("?");
  });
});
