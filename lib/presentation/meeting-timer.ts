export type SlideTimerConfig = {
  timerEnabled: boolean;
  timerSeconds: number | null;
};

export type MeetingTimerState = {
  slideId: string | null;
  timerEnabled: boolean;
  timerSeconds: number | null;
  remainingSeconds: number | null;
  overtimeSeconds: number;
  isRunning: boolean;
  status: "hidden" | "running" | "paused" | "overtime";
  updatedAt: number;
};

function normalizeTimerSeconds(timerEnabled: boolean, timerSeconds: number | null) {
  if (!timerEnabled) return null;
  if (typeof timerSeconds !== "number" || !Number.isFinite(timerSeconds) || timerSeconds <= 0) {
    return null;
  }
  return Math.round(timerSeconds);
}

export function createTimerStateForSlide(
  slideId: string,
  config: SlideTimerConfig,
  updatedAt: number,
): MeetingTimerState {
  const normalizedSeconds = normalizeTimerSeconds(config.timerEnabled, config.timerSeconds);
  if (normalizedSeconds === null) {
    return {
      slideId,
      timerEnabled: false,
      timerSeconds: null,
      remainingSeconds: null,
      overtimeSeconds: 0,
      isRunning: false,
      status: "hidden",
      updatedAt,
    };
  }

  return {
    slideId,
    timerEnabled: true,
    timerSeconds: normalizedSeconds,
    remainingSeconds: normalizedSeconds,
    overtimeSeconds: 0,
    isRunning: true,
    status: "running",
    updatedAt,
  };
}

export function tickTimerState(state: MeetingTimerState, updatedAt: number): MeetingTimerState {
  if (!state.timerEnabled || !state.isRunning) {
    return { ...state, updatedAt };
  }

  if (typeof state.remainingSeconds === "number" && state.remainingSeconds > 0) {
    return {
      ...state,
      remainingSeconds: state.remainingSeconds - 1,
      updatedAt,
    };
  }

  return {
    ...state,
    remainingSeconds: 0,
    overtimeSeconds: state.overtimeSeconds + 1,
    status: "overtime",
    updatedAt,
  };
}

export function pauseTimerState(state: MeetingTimerState, updatedAt: number): MeetingTimerState {
  if (!state.timerEnabled) return { ...state, updatedAt };
  return {
    ...state,
    isRunning: false,
    status: state.status === "overtime" ? "overtime" : "paused",
    updatedAt,
  };
}

export function resumeTimerState(state: MeetingTimerState, updatedAt: number): MeetingTimerState {
  if (!state.timerEnabled) return { ...state, updatedAt };
  return {
    ...state,
    isRunning: true,
    status: state.overtimeSeconds > 0 ? "overtime" : "running",
    updatedAt,
  };
}

export function resetTimerState(state: MeetingTimerState, updatedAt: number): MeetingTimerState {
  const normalizedSeconds = normalizeTimerSeconds(state.timerEnabled, state.timerSeconds);
  if (normalizedSeconds === null) {
    return {
      ...state,
      remainingSeconds: null,
      overtimeSeconds: 0,
      isRunning: false,
      status: "hidden",
      updatedAt,
    };
  }

  return {
    ...state,
    remainingSeconds: normalizedSeconds,
    overtimeSeconds: 0,
    isRunning: true,
    status: "running",
    updatedAt,
  };
}
