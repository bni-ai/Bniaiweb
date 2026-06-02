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
    <div className="min-h-screen bg-surface-2">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-surface p-4">
          <p className="mb-4 text-sm text-text-2">Admin Console</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-text-1 hover:bg-surface-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="mt-6">
            <Button type="submit" variant="ghost" className="w-full justify-center">
              登出
            </Button>
          </form>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
