import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";

const navItems = [
  { href: "/guest", label: "來賓首頁" },
  { href: "/guest/prepare", label: "15 秒準備" },
  { href: "/guest/members", label: "會員資訊" },
  { href: "/guest/content", label: "文章影片" },
];

export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f1]">
      <nav className="border-b border-[#f1d9c5] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">BNI Hua AI Guest</p>
            <p className="text-lg font-semibold text-text-1">來賓專區</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 hover:bg-[#fde8d5]">
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="rounded-full bg-primary px-4 py-2 text-white">
              登入
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost">
                登出
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
