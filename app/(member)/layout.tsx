import type { ReactNode } from "react";
import { headers } from "next/headers";

import { BniPortalShell } from "../../components/layout/bni-portal-shell";
import { getShellIdentity } from "../../lib/auth/shell-identity";

const navGroups = [
  {
    label: "核心任務",
    items: [
      { href: "/dashboard", label: "儀表板", badge: "本週" },
      { href: "/dashboard/report", label: "每週簡報" },
      { href: "/dashboard/one-on-one", label: "一對一預約" },
    ],
  },
  {
    label: "個人網絡",
    items: [
      { href: "/dashboard/profile", label: "個人資料" },
      { href: "/dashboard/gains", label: "GAINS" },
      { href: "/dashboard/top-clients", label: "前十名客戶" },
      { href: "/dashboard/contacts-circle", label: "人脈圈" },
      { href: "/dashboard/directory", label: "會員通訊錄" },
    ],
  },
  {
    label: "分會資源",
    items: [
      { href: "/dashboard/events", label: "活動" },
      { href: "/dashboard/training", label: "培訓紀錄" },
      { href: "/dashboard/ai", label: "AI 助手" },
    ],
  },
];

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const identity = await getShellIdentity();
  const currentPath = (await headers()).get("x-current-path") || "";

  return (
    <BniPortalShell
      currentPath={currentPath}
      identity={identity}
      mode="member"
      navGroups={navGroups}
      showTopbarSearch
      subtitle="本週任務、引薦與一對一進度一次看完"
      topbarSearchAction="/dashboard/directory"
      topbarSearchPlaceholder="搜尋會員姓名、英文名或專業"
      title="會員入口總覽"
    >
      {children}
    </BniPortalShell>
  );
}
