const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ISO dates are printed in a readable form without relying on a locale, so a
// report renders identically wherever it is opened.
export function prettyDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || !MONTHS[index]) return String(value);
  return `${day} ${MONTHS[index]} ${year}`;
}

// Printable cells must stay on one line, so long free text is trimmed.
export function clamp(value, max) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}
