// ─── DangerAlert ──────────────────────────────────────────────────────────────
/**
 * Inline error message shown below a field.
 * @param {string} message - Error text to display
 */
export const DangerAlert = ({ message }) => (
  <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg">
    <svg
      className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
    <p className="text-rose-600 text-xs font-medium leading-snug">{message}</p>
  </div>
);

// ─── TripDurationBadge ────────────────────────────────────────────────────────
/**
 * Displays a pill showing trip length (same-day or N days).
 * Returns null when either date is missing or the range is invalid.
 * @param {string} from - ISO date string (dateOfTravel)
 * @param {string} to   - ISO date string (dateReturned)
 */
export const TripDurationBadge = ({ from, to }) => {
  if (!from || !to) return null;
  const diff = Math.round(
    (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return null;

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-semibold text-blue-600">
        📅 Same-day trip
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-semibold text-emerald-700">
      🗓 {diff} day{diff !== 1 ? "s" : ""} trip
    </span>
  );
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
/**
 * Wraps a form control with a label, optional hint, and inline error.
 * @param {string}    label     - Field label text
 * @param {boolean}   required  - Appends a red asterisk when true
 * @param {string}    error     - Error message (renders DangerAlert when set)
 * @param {string}    hint      - Small helper text shown opposite the label
 * @param {ReactNode} children  - The actual input/select/textarea
 * @param {string}    className - Extra classes on the wrapper div
 */
export const Field = ({ label, required, error, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400 italic">{hint}</span>}
    </div>
    {children}
    {error && <DangerAlert message={error} />}
  </div>
);

// ─── Shared input class helper ────────────────────────────────────────────────
/**
 * Returns Tailwind class string for a text input, toggling error styles.
 * @param {string|boolean} err - Truthy value shows error styling
 */
export const inputCls = (err) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 text-slate-700 bg-white placeholder-slate-300 transition-all duration-200 ${
    err
      ? "border-rose-300 bg-rose-50 focus:ring-rose-100 focus:border-rose-400"
      : "border-slate-200 hover:border-slate-300"
  }`;

// ─── Chip / toggle button class helper ───────────────────────────────────────
/**
 * Returns Tailwind class string for a Yes/No chip button.
 * @param {boolean} active - Whether this chip is selected
 */
export const chipBtn = (active) =>
  `px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none ${
    active
      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
  }`;