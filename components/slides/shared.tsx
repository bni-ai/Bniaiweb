import type { ReactNode } from "react";

export const slideCanvasClass = "flex h-[1080px] w-[1920px] flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.16),_transparent_36%),linear-gradient(180deg,_#fffdf9_0%,_#fff7f1_100%)]";

function Avatar({ name, photoUrl, size = "h-20 w-20" }: { name: string; photoUrl: string | null; size?: string }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${size} rounded-full border border-[#fecaca] object-cover shadow-sm`} />;
  }

  return (
    <div className={`${size} flex items-center justify-center rounded-full bg-[#fee2e2] text-2xl font-bold text-[#dc2626] shadow-sm`}>
      {name.slice(0, 1)}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#b91c1c]">{children}</span>;
}

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-[#fecaca] px-10 py-8">
      <div className="space-y-3">
        <Label>{eyebrow}</Label>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{subtitle}</p> : null}
        </div>
      </div>
      <div className="hidden h-16 w-16 rounded-full bg-[#dc2626] md:block" />
    </header>
  );
}

function TwoColumn({ left, right }: { left: ReactNode; right: ReactNode }) {
  return <div className="grid h-full flex-1 gap-8 px-10 py-8 md:grid-cols-[1.15fr_0.85fr]">{left}{right}</div>;
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#fecaca] bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#b91c1c]">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-base leading-7 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
          <span className="min-w-0 flex-1 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[24px] border border-[#fecaca] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

function clampParagraph(text: string | null | undefined, fallback: string) {
  const value = (text || "").trim();
  return (
    <p className="line-clamp-6 break-words text-base leading-7 text-slate-700">
      {value || fallback}
    </p>
  );
}

export { Avatar, BulletList, InfoCard, Label, SectionTitle, StatCard, TwoColumn, clampParagraph };
