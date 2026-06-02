import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";
import { getShellIdentity, type ShellIdentity } from "../../lib/auth/shell-identity";
import { getSessionRole } from "../../lib/auth/session-role";

const navItems = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/submission", label: "提交狀況" },
  { href: "/admin/presentation", label: "簡報管理" },
  { href: "/admin/keynote", label: "8 分鐘短講" },
  { href: "/admin/guests", label: "來賓管理" },
  { href: "/admin/members", label: "會員管理" },
  { href: "/admin/events", label: "活動管理" },
  { href: "/admin/training", label: "培訓管理" },
  { href: "/admin/import", label: "資料匯入" },
  { href: "/admin/settings", label: "系統設定" },
];

function UserCard({ identity }: { identity: ShellIdentity }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-lg border border-[#dbd1c2] bg-white p-3" data-testid="shell-user-card">
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

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getSessionRole();
  const identity = await getShellIdentity();
  const currentPath = (await headers()).get("x-current-path") || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,168,75,0.08),_transparent_28%),linear-gradient(180deg,#f7f5f1_0%,#efebe4_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="flex min-h-screen flex-col border-r border-[#dbd1c2] bg-[#f9f6f0] p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">BNI Hua AI</p>
          <p className="mb-4 text-sm text-text-2">幹部管理後台</p>
          <UserCard identity={identity} />
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-3 py-2.5 text-sm transition ${
                  currentPath === item.href
                    ? "bg-white font-semibold text-text-1 shadow-[0_8px_24px_rgba(17,24,39,0.05)]"
                    : "text-text-1 hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            {role === "admin" ? (
              <a
                href="/dashboard"
                className="block rounded-2xl border border-[#dbd1c2] bg-white px-3 py-3 text-center text-sm font-medium text-text-1 transition hover:border-primary/30 hover:text-primary"
              >
                切換到會員視角
              </a>
            ) : null}
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full justify-center rounded-full border border-[#dbd1c2] bg-white">
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
