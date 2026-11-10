import { useEffect, useRef, useState } from "react";
import {
  getPendingSessionMinutes,
  getTimerState,
  saveTimerState,
} from "../utils/storage.js";
import {
  getSoundMuted,
  playEndSound,
  prepareAudioContext,
  saveSoundMuted,
} from "../utils/sound.js";
import "./TimerDial.css";

const QUICK_DURATIONS = [
  { minutes: 0.5, label: "30 sec" },
  { minutes: 15, label: "15 min" },
  { minutes: 25, label: "25 min" },
  { minutes: 45, label: "45 min" },
  { minutes: 60, label: "60 min" },
];
const RING_RADIUS = 94;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Show the remaining time and controls for a focus session.
function TimerDial({ onFinish }) {
  const [timer, setTimer] = useState(getTimerState);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isMuted, setIsMuted] = useState(getSoundMuted);
  const [hasEnded, setHasEnded] = useState(
    () => getPendingSessionMinutes() !== null,
  );
  const hasFinished = useRef(false);

  // Calculate remaining time from the deadline so delayed ticks do not add time.
  useEffect(() => {
    if (timer.status !== "running" || timer.endsAt === null) {
      return undefined;
    }

    function updateRemainingTime() {
      const secondsLeft = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
      setTimer((currentTimer) => ({
        ...currentTimer,
        remainingSeconds: secondsLeft,
      }));
    }

    const intervalId = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [timer.endsAt, timer.status]);

  // Finish once when the deadline has passed, including after a page refresh.
  useEffect(() => {
    if (timer.status === "running" && timer.remainingSeconds === 0 && !hasFinished.current) {
      hasFinished.current = true;
      setTimer((currentTimer) => ({ ...currentTimer, status: "idle", endsAt: null }));
      setHasEnded(true);
      try {
        playEndSound();
      } catch (error) {
        console.error("Could not play the timer completion sound:", error);
      }
      onFinish(timer.minutes);
    }
  }, [onFinish, timer.minutes, timer.remainingSeconds, timer.status]);

  // Keep the tab title in sync with the countdown and restore it on unmount.
  const displayTime = `${String(Math.floor(timer.remainingSeconds / 60)).padStart(2, "0")}:${String(
    timer.remainingSeconds % 60,
  ).padStart(2, "0")}`;
  useEffect(() => {
    if (timer.status === "running") {
      document.title = `${displayTime} · Focuslog`;
    } else {
      document.title = hasEnded ? "Time's up! · Focuslog" : "Focuslog";
    }
  }, [displayTime, hasEnded, timer.status]);

  useEffect(
    () => () => {
      document.title = "Focuslog";
    },
    [],
  );

  // Save the current state so refreshing this tab does not reset a session.
  useEffect(() => {
    saveTimerState(timer);
  }, [timer]);

  const totalSeconds = Math.round(timer.minutes * 60);
  const progress = timer.remainingSeconds / totalSeconds;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);
  const parsedCustomMinutes = Number(customMinutes);
  const canUseCustomDuration =
    Number.isSafeInteger(parsedCustomMinutes) &&
    parsedCustomMinutes > 0 &&
    Number.isSafeInteger(parsedCustomMinutes * 60 * 1000);

  function chooseDuration(duration) {
    setTimer({
      minutes: duration,
      remainingSeconds: duration * 60,
      status: "idle",
      endsAt: null,
    });
  }

  function startTimer() {
    // A new run always starts at the selected duration.
    prepareAudioContext().catch((error) => {
      console.error("Could not prepare timer sound:", error);
    });
    hasFinished.current = false;
    setHasEnded(false);
    const endsAt = Date.now() + timer.minutes * 60 * 1000;
    setTimer({
      ...timer,
      remainingSeconds: timer.minutes * 60,
      status: "running",
      endsAt,
    });
  }

  function pauseTimer() {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((timer.endsAt - Date.now()) / 1000),
    );
    setTimer({ ...timer, remainingSeconds, status: "paused", endsAt: null });
  }

  function resumeTimer() {
    if (timer.remainingSeconds === 0) {
      startTimer();
      return;
    }

    hasFinished.current = false;
    setTimer({
      ...timer,
      status: "running",
      endsAt: Date.now() + timer.remainingSeconds * 1000,
    });
  }

  function resetTimer() {
    hasFinished.current = false;
    setHasEnded(false);
    setTimer({
      ...timer,
      remainingSeconds: timer.minutes * 60,
      status: "idle",
      endsAt: null,
    });
  }

  function toggleSound() {
    const nextMuted = !isMuted;
    try {
      saveSoundMuted(nextMuted);
      setIsMuted(nextMuted);
    } catch (error) {
      console.error("Could not save sound preference:", error);
    }
  }

  return (
    <section className="timer-dial" aria-label="Focus timer">
      <div className="timer-durations" aria-label="Choose a timer duration">
        {QUICK_DURATIONS.map((duration) => (
          <button
            aria-pressed={timer.minutes === duration.minutes}
            className={timer.minutes === duration.minutes ? "duration-button selected" : "duration-button"}
            disabled={timer.status !== "idle"}
            key={duration.minutes}
            onClick={() => chooseDuration(duration.minutes)}
            type="button"
          >
            {duration.label}
          </button>
        ))}
      </div>

      <form
        className="custom-duration"
        onSubmit={(event) => {
          event.preventDefault();
          if (canUseCustomDuration) {
            chooseDuration(parsedCustomMinutes);
          }
        }}
      >
        <label htmlFor="custom-duration">Custom minutes</label>
        <input
          aria-describedby="custom-duration-help"
          disabled={timer.status !== "idle"}
          id="custom-duration"
          min="1"
          onChange={(event) => setCustomMinutes(event.target.value)}
          step="1"
          type="number"
          value={customMinutes}
        />
        <button disabled={timer.status !== "idle" || !canUseCustomDuration} type="submit">
          Set
        </button>
        <span className="custom-duration-help" id="custom-duration-help">
          Enter a whole number greater than zero.
        </span>
      </form>

      <div className="timer-ring">
        <svg
          aria-label={`${displayTime} remaining`}
          className="timer-ring-svg"
          role="img"
          viewBox="0 0 220 220"
        >
          <defs>
            <linearGradient id="timerGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#8d7ef7" />
              <stop offset="100%" stopColor="#6fdfd3" />
            </linearGradient>
          </defs>
          <circle className="timer-ring-track" cx="110" cy="110" r={RING_RADIUS} />
          <circle
            className="timer-ring-progress"
            cx="110"
            cy="110"
            r={RING_RADIUS}
            style={{
              strokeDasharray: RING_CIRCUMFERENCE,
              strokeDashoffset: ringOffset,
            }}
          />
        </svg>
        <span className="timer-time" aria-hidden="true">
          {displayTime}
        </span>
      </div>

      <div className="timer-controls">
        {timer.status === "running" ? (
          <button className="timer-button primary" onClick={pauseTimer} type="button">
            Pause
          </button>
        ) : timer.status === "paused" ? (
          <button className="timer-button primary" onClick={resumeTimer} type="button">
            Resume
          </button>
        ) : (
          <button className="timer-button primary" onClick={startTimer} type="button">
            Start
          </button>
        )}
        <button className="timer-button secondary" onClick={resetTimer} type="button">
          Reset
        </button>
        <button
          aria-label={isMuted ? "Sound muted" : "Sound on"}
          aria-pressed={isMuted}
          className="timer-sound-toggle"
          onClick={toggleSound}
          title={isMuted ? "Unmute sound" : "Mute sound"}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path
              d="M11 5 6 9H3v6h3l5 4V5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
            {isMuted ? (
              <path
                d="m16 9 5 6m0-6-5 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            ) : (
              <path
                d="M15 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            )}
          </svg>
        </button>
      </div>
    </section>
  );
}

export default TimerDial;
