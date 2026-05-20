import { useState, useRef, useEffect } from "react";
import { DEPARTMENTS } from "../../constants/departments";
import { inputCls } from "./FormHelpers";

/**
 * DepartmentInput
 * Autocomplete input that filters the DEPARTMENTS list as the user types.
 *
 * @param {string}   value     - Controlled value
 * @param {Function} onChange  - Called with the selected/typed string
 * @param {string}   error     - Error message; triggers error styling when set
 */
export default function DepartmentInput({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = useRef(null);

  const filtered = query.trim()
    ? DEPARTMENTS.filter((d) => d.toLowerCase().includes(query.toLowerCase()))
    : DEPARTMENTS;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep local query in sync when parent value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  return (
    <div ref={ref} className="relative">
      <input
        className={inputCls(error)}
        placeholder="e.g. ICT Department"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((d) => (
            <li
              key={d}
              onMouseDown={() => {
                onChange(d);
                setQuery(d);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                value === d
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-700"
              }`}
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}