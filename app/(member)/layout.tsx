import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";
import { logout } from "../../lib/actions/auth";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-2">
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-text-1">Member Portal</span>
            <Link href="/dashboard">儀表板</Link>
            <Link href="/dashboard/report">每週簡報</Link>
            <Link href="/dashboard/directory">成員名冊</Link>
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost">
              登出
            </Button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
