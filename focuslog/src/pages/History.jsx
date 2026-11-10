import { useEffect, useState } from "react";
import SessionCard from "../components/SessionCard.jsx";
import { deleteSession, getSessions } from "../utils/storage.js";
import { formatDayHeading, groupSessionsByDay } from "../utils/dateHelpers.js";
import "./History.css";

// Show every saved session, grouped by the day it was recorded.
function History() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    try {
      setSessions(getSessions());
    } catch (loadError) {
      setError("Your saved sessions could not be loaded.");
      console.error("Could not load focus sessions:", loadError);
    }
  }, []);

  function handleDeleteSession(sessionId) {
    try {
      setSessions(deleteSession(sessionId));
      setError("");
    } catch (deleteError) {
      setError("That session could not be deleted. Please try again.");
      console.error("Could not delete focus session:", deleteError);
    }
  }

  const totalMinutes = sessions.reduce((total, session) => total + session.minutes, 0);
  const averageRating =
    sessions.length > 0
      ? (
          sessions.reduce((total, session) => total + session.focusRating, 0) /
          sessions.length
        ).toFixed(1)
      : "—";

  const groupedSessions = groupSessionsByDay(sessions, dateFilter);
  const emptyHeading = dateFilter ? formatDayHeading(dateFilter) : "Today";

  function renderDateControl() {
    return (
      <label className="history-calendar-control" title="Choose a day">
        <svg
          aria-hidden="true"
          className="history-calendar-icon"
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect height="17" rx="2.5" width="18" x="3" y="4.5" />
          <path d="M7.5 2.5v4M16.5 2.5v4M3 9h18M7.5 12.5h2M14.5 12.5h2M7.5 16.5h2" />
        </svg>
        <input
          aria-label="Choose a day to filter sessions"
          onChange={(event) => setDateFilter(event.target.value)}
          type="date"
          value={dateFilter}
        />
      </label>
    );
  }

  return (
    <section className="history-page">
      <p className="eyebrow">YOUR JOURNEY</p>
      <h1>Session history</h1>

      <div className="history-summary" aria-label="Session summary">
        <div className="summary-item">
          <strong>{sessions.length}</strong>
          <span>Total sessions</span>
        </div>
        <div className="summary-item">
          <strong>{totalMinutes}</strong>
          <span>Focus minutes</span>
        </div>
        <div className="summary-item">
          <strong>{averageRating}</strong>
          <span>Average focus</span>
        </div>
      </div>

      {error && (
        <p className="sessions-error" role="alert">
          {error}
        </p>
      )}
      {!error && sessions.length === 0 && !dateFilter && (
        <>
          <div className="history-day-heading history-empty-heading">
            <div className="history-day-title">
              {renderDateControl()}
              <h2>Today</h2>
            </div>
          </div>
          <p className="history-empty">
            No sessions yet. Every little bit of focus counts—your sessions will show up here.
          </p>
        </>
      )}
      {!error && dateFilter && groupedSessions.length === 0 && (
        <>
          <div className="history-day-heading history-empty-heading">
            <div className="history-day-title">
              {renderDateControl()}
              <h2>{emptyHeading}</h2>
            </div>
            <button className="history-show-all" onClick={() => setDateFilter("")} type="button">
              Show all
            </button>
          </div>
          <p className="history-empty">
            No sessions on {emptyHeading.toLowerCase()} yet. Try another day or show all sessions.
          </p>
        </>
      )}
      {groupedSessions.map((day) => (
        <section className="history-day" key={day.dateKey}>
          <div className="history-day-heading">
            <div className="history-day-title">
              {day === groupedSessions[0] && renderDateControl()}
              <h2>{day.heading}</h2>
            </div>
            <div className="history-day-summary" aria-label={`Summary for ${day.heading}`}>
              <span>{day.sessionCount} {day.sessionCount === 1 ? "session" : "sessions"}</span>
              <span>{day.totalMinutes} min</span>
              <span>Avg. focus {day.averageRating}/5</span>
            </div>
            {dateFilter && day === groupedSessions[0] && (
              <button className="history-show-all" onClick={() => setDateFilter("")} type="button">
                Show all
              </button>
            )}
          </div>
          <div className="session-list">
            {day.sessions.map((session) => (
              <SessionCard
                key={session.id}
                onDelete={handleDeleteSession}
                session={session}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

export default History;
