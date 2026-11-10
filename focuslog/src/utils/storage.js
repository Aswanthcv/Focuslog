const SESSIONS_KEY = "focuslog-sessions";
const TIMER_STATE_KEY = "focuslog-timer";
const PENDING_SESSION_KEY = "focuslog-pending-session";
const SESSION_DRAFT_KEY = "focuslog-session-draft";

const DEFAULT_TIMER_STATE = {
  minutes: 25,
  remainingSeconds: 25 * 60,
  status: "idle",
  endsAt: null,
};

// Restore a valid timer snapshot, recalculating running time from its deadline.
export function getTimerState() {
  const storedState = sessionStorage.getItem(TIMER_STATE_KEY);
  if (!storedState) {
    return DEFAULT_TIMER_STATE;
  }

  try {
    const timer = JSON.parse(storedState);
    const validMinutes =
      Number.isFinite(timer.minutes) &&
      timer.minutes > 0 &&
      Number.isSafeInteger(timer.minutes * 60 * 1000);
    const validStatus = ["idle", "paused", "running"].includes(timer.status);
    const validRemaining =
      Number.isSafeInteger(timer.remainingSeconds) && timer.remainingSeconds >= 0;
    const validDeadline =
      timer.status !== "running" ||
      (Number.isFinite(timer.endsAt) && timer.endsAt > 0);

    if (!validMinutes || !validStatus || !validRemaining || !validDeadline) {
      throw new Error("Saved timer data is invalid.");
    }

    const remainingSeconds =
      timer.status === "running"
        ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
        : timer.remainingSeconds;

    return {
      minutes: timer.minutes,
      remainingSeconds,
      status: timer.status,
      endsAt: timer.status === "running" ? timer.endsAt : null,
    };
  } catch (error) {
    console.error("Could not restore the timer:", error);
    sessionStorage.removeItem(TIMER_STATE_KEY);
    return DEFAULT_TIMER_STATE;
  }
}

// Save the timer state for this tab so a refresh can restore the countdown.
export function saveTimerState(timer) {
  sessionStorage.setItem(TIMER_STATE_KEY, JSON.stringify(timer));
}

// Keep a completed session prompt available across a page refresh.
export function getPendingSessionMinutes() {
  const storedMinutes = sessionStorage.getItem(PENDING_SESSION_KEY);
  if (storedMinutes === null) {
    return null;
  }

  const minutes = Number(storedMinutes);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
}

export function savePendingSession(minutes) {
  sessionStorage.setItem(PENDING_SESSION_KEY, String(minutes));
}

export function clearPendingSession() {
  sessionStorage.removeItem(PENDING_SESSION_KEY);
}

// Restore reflection fields if the user refreshes while the modal is open.
export function getSessionDraft() {
  const storedDraft = sessionStorage.getItem(SESSION_DRAFT_KEY);
  if (!storedDraft) {
    return { note: "", focusRating: 3, distraction: "" };
  }

  try {
    const draft = JSON.parse(storedDraft);
    if (
      typeof draft.note !== "string" ||
      !Number.isInteger(draft.focusRating) ||
      draft.focusRating < 1 ||
      draft.focusRating > 5 ||
      typeof draft.distraction !== "string"
    ) {
      throw new Error("Saved reflection data is invalid.");
    }

    return draft;
  } catch (error) {
    console.error("Could not restore the session reflection:", error);
    sessionStorage.removeItem(SESSION_DRAFT_KEY);
    return { note: "", focusRating: 3, distraction: "" };
  }
}

export function saveSessionDraft(draft) {
  sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(draft));
}

export function clearSessionDraft() {
  sessionStorage.removeItem(SESSION_DRAFT_KEY);
}

// Read saved sessions and keep the newest one at the top.
export function getSessions() {
  const storedSessions = localStorage.getItem(SESSIONS_KEY);
  if (!storedSessions) {
    return [];
  }

  const sessions = JSON.parse(storedSessions);
  if (!Array.isArray(sessions)) {
    throw new Error("Saved focus sessions must be a list.");
  }

  return sessions.sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
  );
}

// Add a session with its own ID and save the updated newest-first list.
export function saveSession({ minutes, note, focusRating, distraction }) {
  const session = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    minutes,
    note,
    focusRating,
    distraction,
  };
  const sessions = [...getSessions(), session].sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
  );

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return session;
}

// Remove a saved session by its ID.
export function deleteSession(sessionId) {
  const sessions = getSessions().filter((session) => session.id !== sessionId);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return sessions;
}
