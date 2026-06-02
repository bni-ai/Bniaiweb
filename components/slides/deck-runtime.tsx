"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  AgendaSlideProps,
  AwardSlideProps,
  ClosingSlideProps,
  CoverSlideProps,
  GuestSlideProps,
  KeynoteSlideProps,
  MemberSlideProps,
  PresentationRuntimeDeck,
  PresentationRuntimeSlide,
  TeamSlideProps,
  VPReportSlideProps,
} from "../../lib/presentation/types";
import { AgendaSlide, AwardSlide, ClosingSlide, CoverSlide, GuestSlide, KeynoteSlide, MemberSlide, TeamSlide, VPReportSlide } from ".";

type DeckRuntimeProps = {
  deck: PresentationRuntimeDeck;
  mode?: "viewer" | "present";
};

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function renderRuntimeSlide(slide: PresentationRuntimeSlide) {
  switch (slide.type) {
    case "cover":
      return <CoverSlide {...(slide.payload as unknown as CoverSlideProps)} />;
    case "agenda":
      return <AgendaSlide {...(slide.payload as unknown as AgendaSlideProps)} />;
    case "keynote":
      return <KeynoteSlide {...(slide.payload as unknown as KeynoteSlideProps)} />;
    case "member":
      return <MemberSlide {...(slide.payload as unknown as MemberSlideProps)} />;
    case "guest":
      return <GuestSlide {...(slide.payload as unknown as GuestSlideProps)} />;
    case "award":
      return <AwardSlide {...(slide.payload as unknown as AwardSlideProps)} />;
    case "vp_report":
      return <VPReportSlide {...(slide.payload as unknown as VPReportSlideProps)} />;
    case "team":
      return <TeamSlide {...(slide.payload as unknown as TeamSlideProps)} />;
    case "closing":
      return <ClosingSlide {...(slide.payload as unknown as ClosingSlideProps)} />;
  }
}

function ScaledSlideStage({ slide, testId }: { slide: PresentationRuntimeSlide; testId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const rect = container.getBoundingClientRect();
      setScale(Math.max(0.1, Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT)));
    };
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden" data-testid={testId}>
      <div
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#fffdf9] shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
        style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {renderRuntimeSlide(slide)}
        </div>
      </div>
    </div>
  );
}

export function DeckRuntime({ deck, mode = "viewer" }: DeckRuntimeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const slides = deck.slides;
  const activeSlide = slides[activeIndex] || null;
  const nextSlide = slides[activeIndex + 1] || null;
  const pageLabel = slides.length ? `${activeIndex + 1} / ${slides.length}` : "0 / 0";

  const controls = useMemo(() => ({
    previous: () => setActiveIndex((current) => Math.max(0, current - 1)),
    next: () => setActiveIndex((current) => Math.min(Math.max(slides.length - 1, 0), current + 1)),
  }), [slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        controls.next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        controls.previous();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [controls]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const requestFullscreen = async () => {
    try {
      await rootRef.current?.requestFullscreen?.();
    } catch {
      // Fullscreen support varies by browser and permission policy; playback must keep working.
    }
  };

  if (!activeSlide) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#120808] p-6 text-white" data-testid="presentation-runtime">
        <p>這份簡報沒有可播放的投影片。</p>
      </main>
    );
  }

  if (mode === "present") {
    return (
      <main ref={rootRef} className="min-h-screen bg-[#0f0707] p-4 text-white" data-testid="present-mode">
        <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[1fr_360px]">
          <section className="flex min-h-[60vh] flex-col rounded-[28px] bg-black/35 p-3">
            <div className="mb-3 flex items-center justify-between text-sm text-white/70">
              <span>{activeSlide.label}</span>
              <span data-testid="page-label">{pageLabel}</span>
            </div>
            <ScaledSlideStage slide={activeSlide} testId="active-slide" />
          </section>
          <aside className="grid gap-4 rounded-[28px] bg-white/10 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/50">Timer</p>
              <p className="mt-2 text-4xl font-black tabular-nums" data-testid="present-timer">{formatElapsed(elapsedSeconds)}</p>
            </div>
            <div className="h-52 rounded-3xl bg-black/30 p-3">
              {nextSlide ? (
                <ScaledSlideStage slide={nextSlide} testId="next-slide-preview" />
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-white/15 text-lg font-bold" data-testid="next-slide-preview">
                  簡報結束
                </div>
              )}
            </div>
            <div className="rounded-3xl bg-white p-4 text-slate-900">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c]">Speaker Notes</p>
              <p className="mt-3 text-sm leading-7" data-testid="speaker-notes">{activeSlide.notes}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-full border border-white/20 px-4 py-3 text-sm font-semibold disabled:opacity-40" disabled={activeIndex === 0} onClick={controls.previous} type="button">
                上一張
              </button>
              <button className="rounded-full bg-[#dc2626] px-4 py-3 text-sm font-semibold disabled:opacity-40" disabled={activeIndex >= slides.length - 1} onClick={controls.next} type="button">
                下一張
              </button>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main ref={rootRef} className="flex min-h-screen flex-col bg-[#120808] p-4 text-white sm:p-6" data-testid="presentation-runtime">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-white/75">
        <div>
          <p className="font-semibold text-white">{deck.chapterName}</p>
          <p className="text-white/50">{deck.weekDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-white/20 px-4 py-2 font-semibold disabled:opacity-40" disabled={activeIndex === 0} onClick={controls.previous} type="button">
            上一張
          </button>
          <span className="min-w-16 rounded-full bg-white/10 px-4 py-2 text-center font-bold tabular-nums" data-testid="page-label">
            {pageLabel}
          </span>
          <button className="rounded-full border border-white/20 px-4 py-2 font-semibold disabled:opacity-40" disabled={activeIndex >= slides.length - 1} onClick={controls.next} type="button">
            下一張
          </button>
          <button className="rounded-full bg-[#dc2626] px-4 py-2 font-semibold" onClick={requestFullscreen} type="button">
            全螢幕
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ScaledSlideStage slide={activeSlide} testId="active-slide" />
      </div>
    </main>
  );
}
