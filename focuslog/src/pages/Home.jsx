import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SessionModal from "../components/SessionModal.jsx";
import SessionCard from "../components/SessionCard.jsx";
import TimerDial from "../components/TimerDial.jsx";
import {
  clearSessionDraft,
  clearPendingSession,
  deleteSession,
  getPendingSessionMinutes,
  getSessions,
  savePendingSession,
  saveSession,
} from "../utils/storage.js";
import "./Home.css";

// Show the focus timer and let it report when a session finishes.
function Home() {
  const [finishedMinutes, setFinishedMinutes] = useState(getPendingSessionMinutes);
  const [saveError, setSaveError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsError, setSessionsError] = useState("");

  useEffect(() => {
    try {
      setSessions(getSessions());
    } catch (error) {
      setSessionsError("Your saved sessions could not be loaded.");
      console.error("Could not load focus sessions:", error);
    }
  }, []);

  const handleFinish = useCallback((minutes) => {
    setSaveError("");
    try {
      savePendingSession(minutes);
    } catch (error) {
      console.error("Could not preserve the completed session prompt:", error);
    }
    setFinishedMinutes(minutes);
  }, []);

  function handleSaveSession(reflection) {
    try {
      const session = saveSession({ ...reflection, minutes: finishedMinutes });
      setSessions((currentSessions) => [session, ...currentSessions]);
    } catch (error) {
      setSaveError("Your session could not be saved. Please try again.");
      console.error("Could not save focus session:", error);
      return;
    }

    try {
      clearPendingSession();
      clearSessionDraft();
    } catch (error) {
      console.error("Could not clear the completed session reflection:", error);
    }
    setFinishedMinutes(null);
  }

  function handleSkipSession() {
    try {
      clearPendingSession();
      clearSessionDraft();
    } catch (error) {
      console.error("Could not clear the completed session reflection:", error);
    }
    setFinishedMinutes(null);
  }

  function handleDeleteSession(sessionId) {
    try {
      setSessions(deleteSession(sessionId));
      setSessionsError("");
    } catch (error) {
      setSessionsError("That session could not be deleted. Please try again.");
      console.error("Could not delete focus session:", error);
    }
  }

  return (
    <section className="home-page">
      <div className="home-focus">
        <div className="home-heading">
          <h1>Your focus space</h1>
          <p>Choose a time and focus on one thing at a time.</p>
        </div>
        <TimerDial onFinish={handleFinish} />
      </div>
      <section className="recent-sessions" aria-labelledby="recent-sessions-title">
        <div className="recent-sessions-heading">
          <h2 id="recent-sessions-title">Recent sessions</h2>
          <Link className="view-all-link" to="/history">
            View all
          </Link>
        </div>
        {sessionsError && (
          <p className="sessions-error" role="alert">
            {sessionsError}
          </p>
        )}
        {sessions.length > 0 ? (
          <div className="session-list">
            {sessions.slice(0, 3).map((session) => (
              <SessionCard
                key={session.id}
                onDelete={handleDeleteSession}
                session={session}
              />
            ))}
          </div>
        ) : (
          !sessionsError && (
            <p className="sessions-empty">
              Your sessions will appear here. Start with one small focus session.
            </p>
          )
        )}
      </section>
      {finishedMinutes !== null && (
        <SessionModal
          minutes={finishedMinutes}
          onSave={handleSaveSession}
          onSkip={handleSkipSession}
          saveError={saveError}
        />
      )}
    </section>
  );
}

export default Home;
