import Link from "next/link";

import { Button } from "../ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-semibold text-text-1">想加入 BNI 華AI分會？</h2>
        <p className="mt-3 text-sm text-text-2">
          歡迎來信聯繫，我們會提供分會介紹與參與流程說明。
        </p>
        <div className="mt-6">
          <Link href="mailto:huaai@bni.com.tw">
            <Button>申請加入</Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-text-2">huaai@bni.com.tw</p>
      </div>
    </section>
  );
}
