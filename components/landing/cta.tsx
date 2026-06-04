import Link from "next/link";

import { Button } from "../ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-semibold text-text-1">歡迎瞭解 BNI 華 AI 分會</h2>
        <p className="mt-3 text-sm text-text-2">點擊下方參與來賓</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link href="/guest">
            <Button>參與來賓</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
