"use client";

import { Button } from "../ui/button";

export function HeroSection() {
  const onLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-14 md:grid-cols-2 md:items-center">
      <div>
        <p className="mb-2 text-sm text-text-2">系統化商業引薦成長</p>
        <h1 className="mb-4 text-3xl font-bold text-text-1 md:text-4xl">BNI 華AI分會</h1>
        <p className="mb-6 text-text-2">用系統化商業推薦，讓每個人的事業持續成長。</p>
        <Button onClick={onLearnMore}>了解更多</Button>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
        <p className="text-sm text-text-2">例會資訊</p>
        <p className="mt-2 text-xl font-semibold text-text-1">每週固定例會</p>
        <p className="mt-2 text-sm text-text-2">聚焦商業引薦、會員成長與高品質合作機會。</p>
      </div>
    </section>
  );
}
