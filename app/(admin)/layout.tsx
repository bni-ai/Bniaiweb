import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";
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

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getSessionRole();
  const currentPath = (await headers()).get("x-current-path") || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,168,75,0.08),_transparent_28%),linear-gradient(180deg,#f7f5f1_0%,#efebe4_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="flex min-h-screen flex-col border-r border-[#dbd1c2] bg-[#f9f6f0] p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">BNI Hua AI</p>
          <p className="mb-4 text-sm text-text-2">幹部管理後台</p>
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
