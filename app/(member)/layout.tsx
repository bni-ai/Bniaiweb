import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";

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

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.08),_transparent_30%),linear-gradient(180deg,#fffaf8_0%,#f7f4ef_100%)]">
      <nav className="border-b border-[#ead9cc] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">BNI Hua AI</p>
            <p className="text-lg font-semibold text-text-1">會員管理平台</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-3 py-1.5 text-text-2 transition hover:border-[#ead9cc] hover:bg-white hover:text-text-1"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <form action={logout} className="shrink-0">
            <Button type="submit" variant="ghost" className="rounded-full border border-[#ead9cc] bg-white px-4">
              登出
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
