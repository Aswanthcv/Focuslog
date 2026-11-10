import "./SessionCard.css";

const FOCUS_EMOJIS = ["😣", "😕", "😐", "🙂", "🤩"];

// Show the details of one saved focus session.
function SessionCard({ session, onDelete }) {
  const date = new Date(session.date);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const rating = Number.isInteger(session.focusRating)
    ? FOCUS_EMOJIS[session.focusRating - 1]
    : null;

  return (
    <article className="session-card">
      <div className="session-card-top">
        <time className="session-card-time" dateTime={session.date}>
          {time}
        </time>
        <span className="session-card-duration">
          {session.minutes < 1
            ? `${Math.round(session.minutes * 60)} sec`
            : `${session.minutes} min`}
        </span>
      </div>
      <p className="session-card-note">{session.note}</p>
      <div className="session-card-details">
        {rating && (
          <span>
            <span aria-hidden="true">{rating}</span> Focus: {session.focusRating}/5
          </span>
        )}
        {session.distraction && <span>Distracted by: {session.distraction}</span>}
      </div>
      <button
        aria-label={`Delete session: ${session.note}`}
        className="session-card-delete"
        onClick={() => onDelete(session.id)}
        type="button"
      >
        Delete
      </button>
    </article>
  );
}

export default SessionCard;
