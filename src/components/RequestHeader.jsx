import { fmt12, initials } from "../utils/formatters";
import { STATUS_CFG } from "../constants/statusConfig";
 
/**
 * RequestHeader
 * Renders the top section of the modal: reference ID, requester identity,
 * status badge, submitted timestamp, and the 3-column trip summary tiles.
 *
 * @param {object}   request         - The request data object
 * @param {string}   status          - Normalised lowercase status string
 * @param {boolean}  isPending       - True when status === "pending"
 * @param {Function} onClose         - Close button handler
 * @param {Function} onDownloadPDF   - Download PDF button handler
 */
export default function RequestHeader({
  request: src,
  status,
  isPending,
  onClose,
  onDownloadPDF,
}) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
 
  return (
    <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
      {/* ── Top row: ref ID · chip · PDF · close ── */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400 shrink-0">Reservation ID</span>
        <span className="text-sm font-bold text-slate-900 shrink-0">
          {src.referenceNo ? `#${src.referenceNo}` : "#—"}
        </span>
 
        <div className="flex-1" />
 
        {/* Download PDF */}
        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1.5 transition shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download PDF
        </button>
 
        {/* Close */}
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
 
      {/* ── Requester row ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0">
          {initials(src.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
            Requester name
          </p>
          <p className="text-[15px] font-semibold text-slate-900 truncate">
            {src.name || "—"}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${cfg.badge} shrink-0`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </div>
      </div>
 
      {/* ── Submitted timestamp banner ── */}
      {src.timestamp && (
        <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
          <svg
            className="w-3.5 h-3.5 text-blue-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Submitted: {src.timestamp}
          {isPending && (
            <span className="ml-auto text-blue-500 font-medium cursor-pointer hover:underline">
            </span>
          )}
        </div>
      )}
 
      {/* ── Trip summary tiles (3-column) ── */}
      <div className="grid grid-cols-3 mt-3 border border-slate-100 rounded-xl overflow-hidden divide-x divide-slate-100">
        {[
          {
            iconPath:
              "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
            label: "Destination",
            value: src.destination || "—",
          },
          {
            iconPath:
              "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            label: "Date & Time",
            value: src.dateOfTravel
              ? `${src.dateOfTravel}\n${fmt12(src.departureTime)} – ${fmt12(src.expectedReturn)}`
              : "—",
          },
          {
            iconPath:
              "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
            label: "Driver",
            value: src.driver || "Unassigned",
          },
        ].map(({ iconPath, label, value }) => (
          <div key={label} className="px-3 py-3 bg-slate-50/60">
            <div className="flex items-center gap-1 mb-1">
              <svg
                className="w-3 h-3 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
              </svg>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                {label}
              </p>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}