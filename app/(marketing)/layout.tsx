import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "../../components/ui/button";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-2">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-text-2">BNI 分會</p>
            <p className="font-semibold text-text-1">華 AI 分會</p>
          </div>
          <Link href="/login">
            <Button variant="secondary">會員登入</Button>
          </Link>
        </div>
      </header>
      {children}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-text-2">
          <p>BNI 華 AI 分會</p>
          <p>聯絡信箱：bniaitw@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
