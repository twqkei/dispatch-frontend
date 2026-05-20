/**
 * Formats a 24-hour time string (HH:MM) to 12-hour AM/PM format.
 * @param {string} t - Time string in "HH:MM" format
 * @returns {string} Formatted time or "—" if input is falsy
 */
export const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

/**
 * Returns up to 2 uppercase initials from a full name string.
 * @param {string} name
 * @returns {string} e.g. "John Doe" → "JD"
 */
export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");