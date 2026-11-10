export function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toInputValue(iso) {
  const date = new Date(iso);
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function nowInputValue() {
  return toInputValue(new Date().toISOString());
}
