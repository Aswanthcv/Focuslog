import { useEffect, useState } from "react";
import { getSessionDraft, saveSessionDraft } from "../utils/storage.js";
import "./SessionModal.css";

const FOCUS_RATINGS = [
  { value: 1, emoji: "😣", label: "Very difficult" },
  { value: 2, emoji: "😕", label: "Difficult" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

// Collect a short reflection after the timer finishes.
function SessionModal({ minutes, onSave, onSkip, saveError }) {
  const [draft] = useState(getSessionDraft);
  const [note, setNote] = useState(draft.note);
  const [focusRating, setFocusRating] = useState(draft.focusRating);
  const [distraction, setDistraction] = useState(draft.distraction);
  const [noteError, setNoteError] = useState("");

  // Let the user dismiss the reflection with the Escape key.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onSkip();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSkip]);

  function handleSubmit(event) {
    event.preventDefault();

    // Whitespace alone is not a useful session note.
    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setNoteError("Add a short note before saving.");
      return;
    }

    setNoteError("");
    onSave({
      note: trimmedNote,
      focusRating,
      distraction: distraction.trim(),
    });
  }

  return (
    <div className="session-modal-backdrop">
      <section
        aria-labelledby="session-modal-title"
        aria-modal="true"
        className="session-modal"
        role="dialog"
      >
        <p className="session-modal-eyebrow">
          {minutes < 1
            ? `${Math.round(minutes * 60)}-SECOND SESSION`
            : `${minutes}-MINUTE SESSION`}
        </p>
        <h2 id="session-modal-title">What did you do in this session?</h2>
        <form className="session-form" onSubmit={handleSubmit}>
          <label htmlFor="session-note">What did you work on?</label>
          <input
            autoFocus
            aria-invalid={Boolean(noteError)}
            aria-describedby={noteError ? "session-note-error" : undefined}
            id="session-note"
            onChange={(event) => {
              const nextNote = event.target.value;
              setNote(nextNote);
              saveSessionDraft({ note: nextNote, focusRating, distraction });
              if (event.target.value.trim()) {
                setNoteError("");
              }
            }}
            placeholder="Write a few words..."
            required
            value={note}
          />
          {noteError && (
            <p className="session-field-error" id="session-note-error" role="alert">
              {noteError}
            </p>
          )}

          <fieldset className="focus-rating">
            <legend>How was your focus?</legend>
            <div className="focus-rating-options">
              {FOCUS_RATINGS.map((rating) => (
                <button
                  aria-label={`${rating.value}: ${rating.label}`}
                  aria-pressed={focusRating === rating.value}
                  className={
                    focusRating === rating.value
                      ? "focus-rating-button selected"
                      : "focus-rating-button"
                  }
                  key={rating.value}
                  onClick={() => {
                    setFocusRating(rating.value);
                    saveSessionDraft({ note, focusRating: rating.value, distraction });
                  }}
                  type="button"
                >
                  {rating.emoji}
                </button>
              ))}
            </div>
          </fieldset>

          <label htmlFor="session-distraction">What distracted me? (optional)</label>
          <input
            id="session-distraction"
            onChange={(event) => {
              const nextDistraction = event.target.value;
              setDistraction(nextDistraction);
              saveSessionDraft({ note, focusRating, distraction: nextDistraction });
            }}
            placeholder="Anything that pulled your attention..."
            value={distraction}
          />

          {saveError && (
            <p className="session-save-error" role="alert">
              {saveError}
            </p>
          )}

          <div className="session-modal-actions">
            <button className="session-save-button" type="submit">
              Save
            </button>
            <button className="session-skip-button" onClick={onSkip} type="button">
              Skip
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SessionModal;
