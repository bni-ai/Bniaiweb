import type { ReactNode } from "react";
import { headers } from "next/headers";

import { BniPortalShell } from "../../components/layout/bni-portal-shell";
import { getShellIdentity } from "../../lib/auth/shell-identity";

const navGroups = [
  {
    label: "概覽",
    items: [
      { href: "/admin", label: "總覽", badge: "會務" },
    ],
  },
  {
    label: "每週例會",
    items: [
      { href: "/admin/submission", label: "提交狀況" },
      { href: "/admin/presentation", label: "簡報管理" },
      { href: "/admin/keynote", label: "8 分鐘短講" },
      { href: "/admin/vp-report", label: "VP 報告" },
      { href: "/admin/awards", label: "獎項" },
      { href: "/admin/guests", label: "來賓管理" },
    ],
  },
  {
    label: "成員",
    items: [
      { href: "/admin/members", label: "會員管理" },
      { href: "/admin/events", label: "活動管理" },
      { href: "/admin/training", label: "培訓管理" },
      { href: "/admin/import", label: "資料匯入" },
    ],
  },
  {
    label: "系統",
    items: [{ href: "/admin/settings", label: "系統設定" }],
  },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const identity = await getShellIdentity();
  const currentPath = (await headers()).get("x-current-path") || "";
  
  const isWorkspace = /^\/admin\/presentations\/[^/]+$/.test(currentPath);
  const isPresentationSurface = isWorkspace || currentPath === "/admin/presentation";
  const contentClassName = isWorkspace ? "od-content is-workspace" : undefined;

  return (
    <BniPortalShell
      currentPath={currentPath}
      identity={identity}
      mode="admin"
      navGroups={navGroups}
      showTopbarSearch
      showTopbarUser={!isPresentationSurface}
      subtitle="例會準備、投稿審核、簡報發布與資料品質"
      topbarSearchAction="/admin/search"
      topbarSearchPlaceholder="搜尋會員、來賓、簡報"
      title="幹部入口總覽"
      contentClassName={contentClassName}
    >
      {children}
    </BniPortalShell>
  );
}
