import { describe, expect, it } from "vitest";

import {
  createTimerStateForSlide,
  pauseTimerState,
  resetTimerState,
  resumeTimerState,
  tickTimerState,
} from "./meeting-timer";

describe("presentation meeting timer state", () => {
  it("creates a running countdown for timer-enabled slides", () => {
    const state = createTimerStateForSlide("slide-3", { timerEnabled: true, timerSeconds: 30 }, 1_000);

    expect(state).toMatchObject({
      slideId: "slide-3",
      timerEnabled: true,
      timerSeconds: 30,
      remainingSeconds: 30,
      overtimeSeconds: 0,
      isRunning: true,
      status: "running",
    });
  });

  it("creates a hidden state for slides without timer", () => {
    const state = createTimerStateForSlide("slide-4", { timerEnabled: false, timerSeconds: null }, 1_000);

    expect(state.status).toBe("hidden");
    expect(state.isRunning).toBe(false);
    expect(state.remainingSeconds).toBeNull();
  });

  it("falls back to hidden state when timer seconds are missing or invalid", () => {
    const missing = createTimerStateForSlide("slide-4", { timerEnabled: true, timerSeconds: null }, 1_000);
    const invalid = createTimerStateForSlide("slide-4", { timerEnabled: true, timerSeconds: 0 }, 1_000);

    expect(missing.status).toBe("hidden");
    expect(invalid.status).toBe("hidden");
  });

  it("ticks into overtime after countdown reaches zero", () => {
    const countdown = createTimerStateForSlide("slide-5", { timerEnabled: true, timerSeconds: 2 }, 1_000);
    const atOne = tickTimerState(countdown, 2_000);
    const atZero = tickTimerState(atOne, 3_000);
    const overtime = tickTimerState(atZero, 4_000);

    expect(atOne.remainingSeconds).toBe(1);
    expect(atZero.remainingSeconds).toBe(0);
    expect(atZero.status).toBe("running");
    expect(overtime.status).toBe("overtime");
    expect(overtime.overtimeSeconds).toBe(1);
  });

  it("supports pause resume and reset without mutating slide config", () => {
    const initial = createTimerStateForSlide("slide-6", { timerEnabled: true, timerSeconds: 30 }, 1_000);
    const paused = pauseTimerState(tickTimerState(initial, 2_000), 2_000);
    const resumed = resumeTimerState(paused, 3_000);
    const reset = resetTimerState(resumed, 4_000);

    expect(paused.isRunning).toBe(false);
    expect(resumed.isRunning).toBe(true);
    expect(reset.remainingSeconds).toBe(30);
    expect(reset.timerSeconds).toBe(30);
    expect(reset.status).toBe("running");
  });
});
