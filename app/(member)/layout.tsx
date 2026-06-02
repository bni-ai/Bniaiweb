import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";
import { getSessionRole } from "../../lib/auth/session-role";

const navItems = [
  { href: "/dashboard", label: "儀表板" },
  { href: "/dashboard/report", label: "每週簡報" },
  { href: "/dashboard/profile", label: "個人資料" },
  { href: "/dashboard/directory", label: "會員通訊錄" },
  { href: "/dashboard/one-on-one", label: "一對一預約" },
  { href: "/dashboard/events", label: "活動" },
  { href: "/dashboard/training", label: "培訓紀錄" },
  { href: "/dashboard/ai", label: "AI 助手" },
];

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const role = await getSessionRole();
  const currentPath = (await headers()).get("x-current-path") || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.08),_transparent_30%),linear-gradient(180deg,#fffaf8_0%,#f7f4ef_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="flex min-h-screen flex-col border-r border-[#ead9cc] bg-white/70 p-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">BNI Hua AI</p>
            <p className="text-lg font-semibold text-text-1">會員管理平台</p>
          </div>
          <nav className="mt-6 space-y-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-3 py-2.5 transition ${
                  currentPath === item.href
                    ? "bg-white font-semibold text-text-1 shadow-[0_8px_24px_rgba(17,24,39,0.05)]"
                    : "text-text-2 hover:border-[#ead9cc] hover:bg-white hover:text-text-1"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-3 pt-6">
            {role === "admin" ? (
              <Link
                href="/admin"
                className="block rounded-2xl border border-[#ead9cc] bg-white px-3 py-3 text-center text-sm font-medium text-text-1 transition hover:border-primary/30 hover:text-primary"
              >
                返回管理後台
              </Link>
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
