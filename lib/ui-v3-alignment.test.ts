import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("ui v3 alignment source contracts", () => {
  it("keeps app design tokens aligned with the Open Design artifact", () => {
    const artifact = read("bniaiweb-uiux-v3-final-alignment.html");
    const globals = read("app/globals.css");

    expect(artifact).toContain("grid-template-columns: 276px minmax(0, 1fr)");
    expect(artifact).toContain("class=\"topbar\"");
    expect(artifact).toContain("class=\"metric-card\"");
    expect(globals).toContain("grid-template-columns: 276px minmax(0, 1fr)");
    expect(globals).toContain(".od-topbar-user");
    expect(globals).toContain(".od-metric-card");
    expect(globals).toContain("--radius-card: 8px");
    expect(globals).toContain("--radius-input: 8px");
  });

  it("keeps member and admin dashboards wired to Open Design content primitives", () => {
    const memberDashboard = read("app/(member)/dashboard/page.tsx");
    const adminDashboard = read("app/(admin)/admin/page.tsx");

    expect(memberDashboard).toContain("od-content-header");
    expect(memberDashboard).toContain("od-kpi-grid");
    expect(memberDashboard).toContain("od-cta-card");
    expect(adminDashboard).toContain("od-content-header");
    expect(adminDashboard).toContain("od-kpi-grid");
    expect(adminDashboard).toContain("od-table-card");
    expect(memberDashboard).not.toContain("bg-[#1f1b1c]");
    expect(adminDashboard).not.toContain("bg-[#1e1d1a]");
    expect(memberDashboard).not.toContain("rounded-[28px]");
    expect(adminDashboard).not.toContain("rounded-[28px]");
  });

  it("keeps route shells on the shared Open Design shell with login identity in the topbar", () => {
    const shell = read("components/layout/bni-portal-shell.tsx");
    const memberShell = read("app/(member)/layout.tsx");
    const adminShell = read("app/(admin)/layout.tsx");

    expect(memberShell).toContain("BniPortalShell");
    expect(adminShell).toContain("BniPortalShell");
    expect(shell).toContain("od-app-shell");
    expect(shell).toContain("showTopbarUser?: boolean");
    expect(shell).toContain("showTopbarSearch?: boolean");
    expect(shell).toContain("identity.displayName");
    expect(memberShell).not.toContain("rounded-2xl");
    expect(adminShell).not.toContain("rounded-2xl");
  });

  it("uses a functional topbar search form instead of a static chip", () => {
    const shell = read("components/layout/bni-portal-shell.tsx");
    const globals = read("app/globals.css");

    expect(shell).toContain("od-search-form");
    expect(shell).toContain("type=\"search\"");
    expect(shell).toContain("name=\"q\"");
    expect(shell).toContain("搜尋會員、來賓、簡報");
    expect(shell).not.toContain("od-search-chip");
    expect(globals).toContain(".od-search-form");
    expect(globals).toContain(".od-search-input");
  });

  it("suppresses duplicate topbar identity on presentation surfaces", () => {
    const adminLayout = read("app/(admin)/layout.tsx");

    expect(adminLayout).toContain("showTopbarUser={!isPresentationSurface}");
    expect(adminLayout).toContain("isPresentationSurface");
    expect(adminLayout).toContain("/admin/presentation");
    expect(adminLayout).toContain("const isWorkspace = /^\\/admin\\/presentations\\/[^/]+$/.test(currentPath);");
  });

  it("enforces presentation editor workspace-first layout rules", () => {
    const shell = read("components/layout/bni-portal-shell.tsx");
    const adminLayout = read("app/(admin)/layout.tsx");
    const globals = read("app/globals.css");

    // 1. BniPortalShell 應該允許 contentClassName prop 用於自訂主內容區域樣式
    expect(shell).toContain("contentClassName?: string");
    expect(shell).toContain("className={contentClassName || \"od-content\"}");

    // 2. 幹部 layout 應該依據 path 動態決定是否傳入 workspace 的 contentClassName
    expect(adminLayout).toContain("contentClassName={");
    expect(adminLayout).toContain("presentations");

    // 3. globals.css 應該定義 .od-content 移除 max-width（即 max-width: none）以消除全站右側留白
    expect(globals).toContain(".od-content {\n  width: 100%;\n  max-width: none;");

    // 4. globals.css 應該定義三欄重新分配的離散寬度級距 (.od-editor-workspace)
    expect(globals).toContain(".od-editor-workspace");
    expect(globals).toContain("160px minmax(0, 1fr) 272px");
    expect(globals).toContain("188px minmax(0, 1.05fr) 336px");
    expect(globals).toContain("220px minmax(0, 1.12fr) 380px");

    // 5. canvas-editor.tsx 應該套用 .od-editor-workspace 樣式
    const canvasEditor = read("components/presentation/canvas-editor.tsx");
    expect(canvasEditor).toContain("od-editor-workspace");

    // 6. globals.css 應該包含屬性欄 .od-editor-inspector 的內部滾動與 sticky 策略
    expect(globals).toContain(".od-editor-inspector");
    expect(globals).toContain("position: sticky");
    expect(globals).toContain("overflow-y: auto");

    // 7. canvas-editor.tsx 應該將該 class 套用在 inspector aside 元件上
    expect(canvasEditor).toContain("od-editor-inspector");

    // 8. admin/presentations/[id]/page.tsx 不應該用 Card 包裹簡報編輯器（去除雙重外框）
    const presentationPage = read("app/(admin)/admin/presentations/[id]/page.tsx");
    expect(presentationPage).not.toContain("<Card className=\"rounded-2xl p-5\">\n          <div className=\"mb-4 flex items-center justify-between gap-3\">\n            <div>\n              <h2 className=\"text-xl font-semibold\">投影片編輯</h2>");

    // 9. canvas-editor.tsx 不應該為「已上傳底圖」與「圖層元素」加上 border 卡片外框，也不應為張數數字使用 border 圈圈（打字按鍵/打字機樣式）
    expect(canvasEditor).not.toContain("className=\"rounded-2xl border border-border bg-surface-1 p-3\" data-testid=\"presentation-asset-library\"");
    expect(canvasEditor).not.toContain("rounded-full border border-border bg-white px-2 py-1 text-xs text-text-2");
  });

  it("uses Open Design svg icons instead of text placeholders in icon wraps", () => {
    const shell = read("components/layout/bni-portal-shell.tsx");
    const memberDashboard = read("app/(member)/dashboard/page.tsx");
    const adminDashboard = read("app/(admin)/admin/page.tsx");

    expect(shell).toContain("navIconComponents");
    expect(shell).toContain("SearchIcon");
    expect(memberDashboard).not.toMatch(/od-icon-wrap\">[^<]/);
    expect(adminDashboard).not.toMatch(/od-icon-wrap\">[^<]/);
  });

  it("keeps primary Jitsi meeting CTA readable on red background", () => {
    const videoPage = read("app/(member)/dashboard/one-on-one/[id]/video/page.tsx");

    expect(videoPage).toContain("進入視訊會議");
    expect(videoPage).toContain("bg-primary");
    expect(videoPage).toContain("!text-white");
  });

  it("keeps one-on-one visible labels in Traditional Chinese", () => {
    const oneOnOne = read("app/(member)/dashboard/one-on-one/page.tsx");
    const videoPage = read("app/(member)/dashboard/one-on-one/[id]/video/page.tsx");

    expect(oneOnOne).not.toContain(">confirmed<");
    expect(oneOnOne).not.toContain(">completed<");
    expect(oneOnOne).not.toContain(">cancelled<");
    expect(oneOnOne).not.toContain("Ready");
    expect(oneOnOne).not.toContain("One-on-One");
    expect(oneOnOne).not.toContain("Jitsi");
    expect(videoPage).not.toContain("One-on-One");
    expect(videoPage).not.toContain("Jitsi");
  });

  it("enforces keynote page layout and navigation title rules", () => {
    const keynotePage = read("app/(admin)/admin/keynote/page.tsx");
    expect(keynotePage).toContain("簡報系統");
    expect(keynotePage).not.toContain("簡報管理連結");
    expect(keynotePage).not.toContain("<Card className=\"rounded-[24px] p-5\">");
  });
});
