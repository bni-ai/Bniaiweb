import { describe, expect, it } from "vitest";

import { resolveAdminSearchHref } from "./topbar-search";

describe("resolveAdminSearchHref", () => {
  it("routes empty input back to admin home", () => {
    expect(resolveAdminSearchHref("   ")).toBe("/admin");
  });

  it("routes presentation keywords to the presentation hub", () => {
    expect(resolveAdminSearchHref("簡報")).toBe("/admin/presentation");
    expect(resolveAdminSearchHref("presentation")).toBe("/admin/presentation");
  });

  it("routes guest and keynote keywords to dedicated pages", () => {
    expect(resolveAdminSearchHref("來賓名單")).toBe("/admin/guests");
    expect(resolveAdminSearchHref("8 分鐘短講")).toBe("/admin/keynote");
  });

  it("falls back to members search for generic keywords", () => {
    expect(resolveAdminSearchHref("王小明")).toBe("/admin/members?q=%E7%8E%8B%E5%B0%8F%E6%98%8E");
  });
});
