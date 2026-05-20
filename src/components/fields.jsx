// ─── InfoField ────────────────────────────────────────────────────────────────
/**
 * Read-only display field with a small label above the value.
 * @param {string}  label  - Field label
 * @param {string}  value  - Display value (falls back to "—")
 * @param {boolean} full   - If true, spans 2 grid columns (col-span-2)
 */
export const InfoField = ({ label, value, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-0.5">
      {label}
    </p>
    <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
  </div>
);

// ─── EditField ────────────────────────────────────────────────────────────────
/**
 * Editable input/textarea field with a small label above it.
 * @param {string}   label        - Field label
 * @param {string}   value        - Controlled value
 * @param {Function} onChange     - Called with the new string value
 * @param {string}   type         - Input type or "textarea"
 * @param {string}   placeholder  - Placeholder text
 * @param {boolean}  full         - If true, spans 2 grid columns (col-span-2)
 */
export const EditField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  full,
}) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">
      {label}
    </p>
    {type === "textarea" ? (
      <textarea
        rows={3}
        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);