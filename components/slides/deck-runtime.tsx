"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createTimerStateForSlide,
  pauseTimerState,
  resetTimerState,
  resumeTimerState,
  tickTimerState,
  type MeetingTimerState,
} from "../../lib/presentation/meeting-timer";
import type { PresentationRuntimeDeck, PresentationRuntimeSlide } from "../../lib/presentation/types";
import { EditorSlideFrame } from "../presentation/editor-slide-frame";

type DeckRuntimeProps = {
  deck: PresentationRuntimeDeck;
  mode?: "viewer" | "present";
};

type TimerSessionPayload = {
  weekDate: string;
  activeIndex: number;
  timerState: MeetingTimerState;
};

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const TIMER_SESSION_PREFIX = "presentation-timer-session:";

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatTimerLabel(timerState: MeetingTimerState) {
  if (!timerState.timerEnabled) return null;
  if (timerState.status === "overtime") {
    return `+${formatClock(timerState.overtimeSeconds)}`;
  }
  const value = typeof timerState.remainingSeconds === "number" ? timerState.remainingSeconds : 0;
  return formatClock(value);
}

function parseTimerSession(raw: string | null): TimerSessionPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TimerSessionPayload;
  } catch {
    return null;
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
          <EditorSlideFrame slide={slide} />
        </div>
      </div>
    </div>
  );
}

function PresentationTimerOverlay({
  mode,
  timerState,
  onPause,
  onReset,
  onResume,
}: {
  mode: "viewer" | "present";
  timerState: MeetingTimerState;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}) {
  const label = formatTimerLabel(timerState);
  if (!label) return null;

  return (
    <div className="fixed right-4 top-4 z-30 flex flex-col items-end gap-3" data-testid={mode === "present" ? "present-timer-overlay" : "viewer-timer-overlay"}>
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-full border-4 bg-black/70 text-center shadow-2xl ${
          timerState.status === "overtime" ? "border-red-400 text-red-200" : "border-white/60 text-white"
        }`}
      >
        <div className="px-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/60">Timer</div>
          <div className="mt-1 text-3xl font-black tabular-nums" data-testid={mode === "present" ? "present-timer" : "viewer-slide-timer"}>
            {label}
          </div>
        </div>
      </div>
      {mode === "present" ? (
        <div className="flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs font-semibold text-white shadow-xl">
          {timerState.isRunning ? (
            <button className="rounded-full border border-white/20 px-3 py-1.5" data-testid="present-timer-pause" onClick={onPause} type="button">
              暫停
            </button>
          ) : (
            <button className="rounded-full border border-white/20 px-3 py-1.5" data-testid="present-timer-resume" onClick={onResume} type="button">
              繼續
            </button>
          )}
          <button className="rounded-full bg-white/15 px-3 py-1.5" data-testid="present-timer-reset" onClick={onReset} type="button">
            重置
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DeckRuntime({ deck, mode = "viewer" }: DeckRuntimeProps) {
  const slides = deck.slides;
  const sessionStorageKey = `${TIMER_SESSION_PREFIX}${deck.weekDate}`;
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipViewerLocalSyncRef = useRef(false);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [timerState, setTimerState] = useState<MeetingTimerState>(() => createTimerStateForSlide(
    slides[0]?.id || "slide-0",
    {
      timerEnabled: slides[0]?.editor.timerEnabled ?? false,
      timerSeconds: slides[0]?.editor.timerSeconds ?? null,
    },
    Date.now(),
  ));
  const activeSlide = slides[activeIndex] || null;
  const nextSlide = slides[activeIndex + 1] || null;
  const pageLabel = slides.length ? `${activeIndex + 1} / ${slides.length}` : "0 / 0";

  const buildTimerStateForIndex = useCallback((index: number, updatedAt: number) => {
    const slide = slides[index];
    return createTimerStateForSlide(
      slide?.id || `slide-${index}`,
      {
        timerEnabled: slide?.editor.timerEnabled ?? false,
        timerSeconds: slide?.editor.timerSeconds ?? null,
      },
      updatedAt,
    );
  }, [slides]);

  const publishTimerSession = useCallback((nextActiveIndex: number, nextTimerState: MeetingTimerState) => {
    if (typeof window === "undefined" || mode !== "present") return;
    const payload: TimerSessionPayload = {
      weekDate: deck.weekDate,
      activeIndex: nextActiveIndex,
      timerState: nextTimerState,
    };
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(payload));
    channelRef.current?.postMessage(payload);
  }, [deck.weekDate, mode, sessionStorageKey]);

  const controls = useMemo(() => ({
    previous: () => setActiveIndex((current) => Math.max(0, current - 1)),
    next: () => setActiveIndex((current) => Math.min(Math.max(slides.length - 1, 0), current + 1)),
  }), [slides.length]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    setIsReady(true);
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
    if (typeof window === "undefined") return undefined;

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(sessionStorageKey);
    }

    if (mode === "viewer") {
      const applySessionPayload = (payload: TimerSessionPayload | null) => {
        if (!payload || payload.weekDate !== deck.weekDate) return;
        skipViewerLocalSyncRef.current = true;
        setActiveIndex(payload.activeIndex);
        setTimerState(payload.timerState);
      };

      applySessionPayload(parseTimerSession(window.localStorage.getItem(sessionStorageKey)));

      const onStorage = (event: StorageEvent) => {
        if (event.key !== sessionStorageKey) return;
        applySessionPayload(parseTimerSession(event.newValue));
      };

      const onChannelMessage = (event: MessageEvent<TimerSessionPayload>) => {
        applySessionPayload(event.data);
      };

      channelRef.current?.addEventListener("message", onChannelMessage);
      window.addEventListener("storage", onStorage);
      return () => {
        channelRef.current?.removeEventListener("message", onChannelMessage);
        window.removeEventListener("storage", onStorage);
        channelRef.current?.close();
        channelRef.current = null;
      };
    }

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [deck.weekDate, mode, sessionStorageKey]);

  useEffect(() => {
    if (!isReady) return;

    if (mode === "present") {
      const nextState = buildTimerStateForIndex(activeIndex, Date.now());
      setTimerState(nextState);
      publishTimerSession(activeIndex, nextState);
      return;
    }

    if (skipViewerLocalSyncRef.current) {
      skipViewerLocalSyncRef.current = false;
      return;
    }

    const fallbackState = pauseTimerState(buildTimerStateForIndex(activeIndex, Date.now()), Date.now());
    setTimerState(fallbackState);
  }, [activeIndex, buildTimerStateForIndex, isReady, mode, publishTimerSession]);

  useEffect(() => {
    if (mode !== "present" || !timerState.isRunning || !timerState.timerEnabled) return;

    const timer = window.setInterval(() => {
      setTimerState((current) => {
        const next = tickTimerState(current, Date.now());
        publishTimerSession(activeIndexRef.current, next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, publishTimerSession, timerState.isRunning, timerState.timerEnabled]);

  const requestFullscreen = async () => {
    try {
      await rootRef.current?.requestFullscreen?.();
    } catch {
      // Fullscreen support varies by browser and permission policy; playback must keep working.
    }
  };

  if (!activeSlide) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#120808] p-6 text-white" data-runtime-ready={isReady ? "true" : "false"} data-testid="presentation-runtime">
        <p>這份簡報沒有可播放的投影片。</p>
      </main>
    );
  }

  if (mode === "present") {
    return (
      <main ref={rootRef} className="min-h-screen bg-[#0f0707] p-4 text-white" data-runtime-ready={isReady ? "true" : "false"} data-testid="present-mode">
        <PresentationTimerOverlay
          mode="present"
          onPause={() => {
            const next = pauseTimerState(timerState, Date.now());
            setTimerState(next);
            publishTimerSession(activeIndex, next);
          }}
          onReset={() => {
            const next = resetTimerState(timerState, Date.now());
            setTimerState(next);
            publishTimerSession(activeIndex, next);
          }}
          onResume={() => {
            const next = resumeTimerState(timerState, Date.now());
            setTimerState(next);
            publishTimerSession(activeIndex, next);
          }}
          timerState={timerState}
        />
        <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[1fr_360px]">
          <section className="flex min-h-[60vh] flex-col rounded-[28px] bg-black/35 p-3">
            <div className="mb-3 flex items-center justify-between text-sm text-white/70">
              <span>{activeSlide.label}</span>
              <span data-testid="page-label">{pageLabel}</span>
            </div>
            <ScaledSlideStage slide={activeSlide} testId="active-slide" />
          </section>
          <aside className="grid gap-4 rounded-[28px] bg-white/10 p-4">
            <div className="text-sm text-white/70">
              {timerState.timerEnabled ? "此頁 timer 已啟用，可在右上角控制。" : "此頁未啟用 timer。"}
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c]">講者備註</p>
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
    <main ref={rootRef} className="flex min-h-screen flex-col bg-[#120808] p-4 text-white sm:p-6" data-runtime-ready={isReady ? "true" : "false"} data-testid="presentation-runtime">
      <PresentationTimerOverlay mode="viewer" onPause={() => undefined} onReset={() => undefined} onResume={() => undefined} timerState={timerState} />
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
