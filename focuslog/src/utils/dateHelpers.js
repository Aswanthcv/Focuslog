// Build a date key using local calendar parts, not UTC.
export function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse a date-input value as a local date to avoid shifting its calendar day.
function dateFromLocalKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Use friendly labels for recent days and a full weekday date for older days.
export function formatDayHeading(dateKey, today = new Date()) {
  const date = dateFromLocalKey(dateKey);
  const todayKey = getLocalDateKey(today);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  if (dateKey === todayKey) {
    return "Today";
  }
  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Group sessions by their local day and sort each group newest first.
export function groupSessionsByDay(sessions, dateFilter = "") {
  const groups = new Map();

  sessions.forEach((session) => {
    const date = new Date(session.date);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const dateKey = getLocalDateKey(date);
    if (dateFilter && dateKey !== dateFilter) {
      return;
    }

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(session);
  });

  return Array.from(groups.entries())
    .sort(([firstDay], [secondDay]) => secondDay.localeCompare(firstDay))
    .map(([dateKey, daySessions]) => {
      const sortedSessions = daySessions.sort(
        (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
      );
      const totalMinutes = sortedSessions.reduce(
        (total, session) => total + session.minutes,
        0,
      );
      const averageRating =
        sortedSessions.reduce((total, session) => total + session.focusRating, 0) /
        sortedSessions.length;

      return {
        dateKey,
        heading: formatDayHeading(dateKey),
        sessions: sortedSessions,
        sessionCount: sortedSessions.length,
        totalMinutes,
        averageRating: averageRating.toFixed(1),
      };
    });
}
