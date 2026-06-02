import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";

const navItems = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/submission", label: "提交狀況" },
  { href: "/admin/presentation", label: "簡報管理" },
  { href: "/admin/keynote", label: "8 分鐘短講" },
  { href: "/admin/guests", label: "來賓管理" },
  { href: "/admin/members", label: "會員管理" },
  { href: "/admin/import", label: "資料匯入" },
  { href: "/admin/settings", label: "系統設定" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,168,75,0.08),_transparent_28%),linear-gradient(180deg,#f7f5f1_0%,#efebe4_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-r border-[#dbd1c2] bg-[#f9f6f0] p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">BNI Hua AI</p>
          <p className="mb-4 text-sm text-text-2">幹部管理後台</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-3 py-2.5 text-sm text-text-1 transition hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="mt-6">
            <Button type="submit" variant="ghost" className="w-full justify-center rounded-full border border-[#dbd1c2] bg-white">
              登出
            </Button>
          </form>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
