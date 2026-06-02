import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";
import { getShellIdentity, type ShellIdentity } from "../../lib/auth/shell-identity";
import { getSessionRole } from "../../lib/auth/session-role";

const navGroups = [
  {
    label: "核心任務",
    items: [
      { href: "/dashboard", label: "儀表板" },
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

function isActivePath(currentPath: string, href: string) {
  if (href === "/dashboard") return currentPath === href;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function UserCard({ identity }: { identity: ShellIdentity }) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-lg border border-[#ead9cc] bg-white p-3" data-testid="shell-user-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-white">
        {identity.avatarUrl ? <img src={identity.avatarUrl} alt={identity.displayName} className="h-full w-full object-cover" /> : identity.initial}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-1">{identity.displayName}</p>
        <p className="truncate text-xs text-text-2">{identity.secondaryLabel}</p>
        <span className="mt-1 inline-flex rounded bg-[#fef2f2] px-1.5 py-0.5 text-[10px] font-semibold text-primary">{identity.roleLabel}</span>
      </div>
    </div>
  );
}

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const role = await getSessionRole();
  const identity = await getShellIdentity();
  const currentPath = (await headers()).get("x-current-path") || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.08),_transparent_30%),linear-gradient(180deg,#fffaf8_0%,#f7f4ef_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="flex min-h-screen flex-col border-r border-[#ead9cc] bg-white/80 p-4 backdrop-blur" data-testid="member-sidebar">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">BNI Hua AI</p>
            <p className="text-lg font-semibold text-text-1">會員管理平台</p>
          </div>
          <UserCard identity={identity} />
          <nav className="mt-6 space-y-5 text-sm">
            {navGroups.map((group) => (
              <section key={group.label} className="space-y-1.5">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-2">{group.label}</p>
                {group.items.map((item) => {
                  const active = isActivePath(currentPath, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-2xl px-3 py-2.5 transition ${
                        active
                          ? "border border-primary/20 bg-white font-semibold text-text-1 shadow-[0_10px_28px_rgba(17,24,39,0.07)]"
                          : "border border-transparent text-text-2 hover:border-[#ead9cc] hover:bg-white hover:text-text-1"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </section>
            ))}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            {role === "admin" ? (
              <a
                href="/admin"
                className="block rounded-2xl border border-[#ead9cc] bg-white px-3 py-3 text-center text-sm font-medium text-text-1 transition hover:border-primary/30 hover:text-primary"
              >
                返回管理後台
              </a>
            ) : null}
            <form action={logout} className="shrink-0">
              <Button type="submit" variant="ghost" className="w-full rounded-full border border-[#ead9cc] bg-white px-4">
                登出
              </Button>
            </form>
          </div>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
