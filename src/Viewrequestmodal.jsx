import { useState, useRef } from "react";

// ─── Utility: format time to 12hr ────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ─── Receipt Row ──────────────────────────────────────────────────────────────
const Row = ({ label, value, full }) => (
  <div className={`flex ${full ? "flex-col gap-0.5" : "justify-between items-start gap-4"} py-2 border-b border-dashed border-slate-200 last:border-0`}>
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">{label}</span>
    <span className={`text-xs font-medium text-slate-700 ${full ? "" : "text-right"}`}>{value || "—"}</span>
  </div>
);

// ─── Editable Row ─────────────────────────────────────────────────────────────
const EditRow = ({ label, value, onChange, type = "text", full, placeholder }) => (
  <div className={`flex ${full ? "flex-col gap-1" : "justify-between items-start gap-4"} py-2 border-b border-dashed border-slate-200 last:border-0`}>
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 shrink-0">{label}</span>
    {type === "textarea" ? (
      <textarea
        rows={3}
        className="text-xs font-medium text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className={`text-xs font-medium text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300 ${full ? "w-full" : "text-right w-40"}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const Section = ({ icon, title }) => (
  <div className="flex items-center gap-2 mt-5 mb-2">
    <span className="text-base leading-none">{icon}</span>
    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{title}</span>
    <div className="flex-1 h-px bg-emerald-100" />
  </div>
);

// ─── Main: ViewRequestModal ───────────────────────────────────────────────────
export default function ViewRequestModal({ request, onClose, onSave }) {
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState({ ...request });
  const [saving, setSaving]     = useState(false);

  if (!request) return null;

  const status     = (request.status || "").toLowerCase();
  const isPending  = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "disapproved" || status === "rejected";

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  // ── Save edits back to SheetDB ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const ts = encodeURIComponent(request.timestamp || "");
      await fetch(`https://sheetdb.io/api/v1/cyqjdv9avucvn/Timestamp/${ts}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            "Name:":                  draft.name,
            "Department / Office":    draft.department,
            "Immediate Head":         draft.immediateHead,
            "Mobile Number":          draft.mobile,
            "Date of Travel":         draft.dateOfTravel,
            "Travel Destination":     draft.destination,
            "Purpose of Travel":      draft.purpose,
            "Waiting Area":           draft.waitingArea,
            "Time of Departure":      draft.departureTime,
            "Expected Return":        draft.expectedReturn,
            "Number of Passengers":   draft.numPassengers,
            "Name of Passengers":     draft.passengerNames,
            "Project Based Travel":   draft.projectBased,
            "Funding Type":           draft.fundingType,
          },
        }),
      });
      setEditing(false);
      onSave && onSave(draft);
    } catch (e) {
      alert("Failed to save changes. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => { setDraft({ ...request }); setEditing(false); };

  // ── PDF download via print-optimized HTML ───────────────────────────────────
  const handleDownloadPDF = () => {
    const src = isApproved ? request : draft;
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Vehicle Request – ${src.name || "Request"}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: A4; margin: 24mm 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: white; font-size: 12px; }

  .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #10b981; margin-bottom: 20px; }
  .header-left h1 { font-size: 18px; font-weight: 700; color: #065f46; margin-bottom: 2px; }
  .header-left p  { font-size: 10px; color: #64748b; }
  .header-right   { text-align: right; }
  .ref  { font-family: monospace; font-size: 10px; color: #64748b; margin-bottom: 4px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge.approved   { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
  .badge.pending    { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .badge.disapproved, .badge.rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

  .section { margin-top: 18px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #10b981; white-space: nowrap; }
  .section-line  { flex: 1; height: 1px; background: #d1fae5; }

  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 4px; font-size: 11px; border-bottom: 1px dashed #e2e8f0; vertical-align: top; }
  td.lbl { color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.06em; width: 38%; white-space: nowrap; padding-right: 12px; }
  td.val { color: #1e293b; font-weight: 500; }

  .approved-box { margin-top: 18px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 12px 16px; }
  .approved-box h3 { color: #065f46; font-size: 11px; font-weight: 700; margin-bottom: 4px; }
  .approved-box p  { color: #047857; font-size: 10px; }
  .assigned-row { display: flex; gap: 24px; margin-top: 8px; }
  .assigned-item label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.08em; display: block; }
  .assigned-item span  { font-size: 12px; font-weight: 700; color: #065f46; }

  .footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 9px; color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>🚗 Vehicle Request</h1>
      <p>DNSC Motor Pool Services Unit – Davao del Norte State College</p>
    </div>
    <div class="header-right">
      <div class="ref">REF# ${src.referenceNo || "N/A"}</div>
      <div class="ref">Submitted: ${src.timestamp || "—"}</div>
      <span class="badge ${status}">${request.status || "Pending"}</span>
    </div>
  </div>

  <div class="section"><span class="section-title">👤 Requester Information</span><div class="section-line"></div></div>
  <table>
    <tr><td class="lbl">Name</td><td class="val">${src.name || "—"}</td></tr>
    <tr><td class="lbl">Email</td><td class="val">${src.email || "—"}</td></tr>
    <tr><td class="lbl">Department / Office</td><td class="val">${src.department || "—"}</td></tr>
    <tr><td class="lbl">Immediate Head</td><td class="val">${src.immediateHead || "—"}</td></tr>
    <tr><td class="lbl">Mobile Number</td><td class="val">${src.mobile || "—"}</td></tr>
  </table>

  <div class="section"><span class="section-title">✈️ Travel Details</span><div class="section-line"></div></div>
  <table>
    <tr><td class="lbl">Date of Travel</td><td class="val">${src.dateOfTravel || "—"}</td></tr>
    <tr><td class="lbl">Destination</td><td class="val">${src.destination || "—"}</td></tr>
    <tr><td class="lbl">Waiting Area</td><td class="val">${src.waitingArea || "—"}</td></tr>
    <tr><td class="lbl">Time of Departure</td><td class="val">${fmt12(src.departureTime)}</td></tr>
    <tr><td class="lbl">Expected Return</td><td class="val">${fmt12(src.expectedReturn)}</td></tr>
    <tr><td class="lbl">Purpose of Travel</td><td class="val">${src.purpose || "—"}</td></tr>
  </table>

  <div class="section"><span class="section-title">👥 Passengers</span><div class="section-line"></div></div>
  <table>
    <tr><td class="lbl">Number of Passengers</td><td class="val">${src.numPassengers || "—"}</td></tr>
    <tr><td class="lbl">Passenger Names</td><td class="val">${(src.passengerNames || "—").replace(/\n/g, ", ")}</td></tr>
    <tr><td class="lbl">Project Based Travel</td><td class="val">${src.projectBased || "—"}</td></tr>
    ${src.projectBased === "Yes" ? `<tr><td class="lbl">Funding Type</td><td class="val">${src.fundingType || "—"}</td></tr>` : ""}
  </table>

  ${isApproved && (src.driver || src.vehicle) ? `
  <div class="approved-box">
    <h3>✅ Request Approved</h3>
    <p>This trip has been officially approved and added to the schedule.</p>
    <div class="assigned-row">
      ${src.vehicle ? `<div class="assigned-item"><label>Assigned Vehicle</label><span>${src.vehicle}</span></div>` : ""}
      ${src.driver  ? `<div class="assigned-item"><label>Assigned Driver</label><span>${src.driver}</span></div>`  : ""}
    </div>
  </div>` : ""}

  <div class="footer">
    Generated by DNSC Vehicle Scheduling System &nbsp;·&nbsp; This is an official vehicle request document.
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) alert("Please allow pop-ups to download the PDF.");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // ── Status color ────────────────────────────────────────────────────────────
  const statusColor = {
    approved:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending:     "bg-amber-100 text-amber-700 border-amber-200",
    disapproved: "bg-red-100 text-red-700 border-red-200",
    rejected:    "bg-red-100 text-red-700 border-red-200",
  }[status] || "bg-slate-100 text-slate-600 border-slate-200";

  // ── Display source: use draft when editing, request otherwise ───────────────
  const src = editing ? draft : request;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-6 pb-5 rounded-t-2xl shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">DNSC Motor Pool</p>
              <h2 className="text-white text-xl font-bold leading-tight">Vehicle Request</h2>
              {request.referenceNo && (
                <p className="text-emerald-200 text-[11px] mt-1 font-mono">REF # {request.referenceNo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor}`}>
                {request.status || "Pending"}
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {request.timestamp && (
            <p className="text-emerald-200 text-[11px] mt-3 border-t border-emerald-400/40 pt-3">
              📅 Submitted: {request.timestamp}
            </p>
          )}
        </div>

        {/* ── Edit mode banner ──────────────────────────────────────────────── */}
        {editing && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-xs text-amber-700 font-medium">Editing — changes will be saved to your request</span>
          </div>
        )}

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* ── Approved: assigned vehicle & driver box ── */}
          {isApproved && (request.vehicle || request.driver) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-1 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-800 text-xs font-bold">Request Approved</p>
                  <p className="text-emerald-600 text-[11px]">This trip has been added to the schedule.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {request.vehicle && (
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Vehicle</p>
                    <p className="text-sm font-bold text-emerald-700">{request.vehicle}</p>
                  </div>
                )}
                {request.driver && (
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Driver</p>
                    <p className="text-sm font-bold text-emerald-700">{request.driver}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Approved with no assignment yet ── */}
          {isApproved && !request.vehicle && !request.driver && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-1 flex items-center gap-3">
              <div className="w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-800 text-xs font-bold">Request Approved</p>
                <p className="text-emerald-600 text-[11px]">Vehicle and driver will be assigned soon.</p>
              </div>
            </div>
          )}

          {/* ── Pending notice ── */}
          {isPending && !editing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-1 flex items-center gap-3">
              <span className="text-xl leading-none">⏳</span>
              <p className="text-amber-700 text-xs">Awaiting admin approval. You can still edit your request while it's pending.</p>
            </div>
          )}

          {/* ── Rejected notice ── */}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-1 flex items-center gap-3">
              <span className="text-xl leading-none">✕</span>
              <p className="text-red-700 text-xs">This request was not approved. Please contact the admin for details.</p>
            </div>
          )}

          {/* ── Requester Info ── */}
          <Section icon="👤" title="Requester Info" />
          {editing ? (<>
            <EditRow label="Name"           value={draft.name}          onChange={set("name")}          placeholder="Full name" />
            <EditRow label="Department"     value={draft.department}    onChange={set("department")}    placeholder="Department / Office" />
            <EditRow label="Immediate Head" value={draft.immediateHead} onChange={set("immediateHead")} placeholder="Supervisor name" />
            <EditRow label="Mobile"         value={draft.mobile}        onChange={set("mobile")}        placeholder="09xx-xxx-xxxx" />
          </>) : (<>
            <Row label="Name"           value={src.name} />
            <Row label="Email"          value={src.email} />
            <Row label="Department"     value={src.department} />
            <Row label="Immediate Head" value={src.immediateHead} />
            <Row label="Mobile"         value={src.mobile} />
          </>)}

          {/* ── Travel Details ── */}
          <Section icon="✈️" title="Travel Details" />
          {editing ? (<>
            <EditRow label="Date of Travel"  value={draft.dateOfTravel}  onChange={set("dateOfTravel")}  type="date" />
            <EditRow label="Destination"     value={draft.destination}   onChange={set("destination")}   placeholder="e.g. Manila, NCR" />
            <EditRow label="Purpose"         value={draft.purpose}       onChange={set("purpose")}       type="textarea" placeholder="Purpose of travel" full />
            <EditRow label="Waiting Area"    value={draft.waitingArea}   onChange={set("waitingArea")}   placeholder="e.g. Main Gate" />
            <EditRow label="Departure"       value={draft.departureTime} onChange={set("departureTime")} type="time" />
            <EditRow label="Return"          value={draft.expectedReturn}onChange={set("expectedReturn")}type="time" />
          </>) : (<>
            <Row label="Date of Travel"  value={src.dateOfTravel} />
            <Row label="Destination"     value={src.destination} />
            <Row label="Waiting Area"    value={src.waitingArea} />
            <Row label="Departure"       value={fmt12(src.departureTime)} />
            <Row label="Expected Return" value={fmt12(src.expectedReturn)} />
            <Row label="Purpose"         value={src.purpose} full />
          </>)}

          {/* ── Passengers ── */}
          <Section icon="👥" title="Passengers" />
          {editing ? (<>
            <EditRow label="Count"         value={draft.numPassengers}  onChange={set("numPassengers")}  type="number" placeholder="e.g. 4" />
            <EditRow label="Names"         value={draft.passengerNames} onChange={set("passengerNames")} type="textarea" placeholder="One per line" full />
            <EditRow label="Project Based" value={draft.projectBased}   onChange={set("projectBased")}   placeholder="Yes / No" />
            {draft.projectBased === "Yes" && (
              <EditRow label="Funding Type" value={draft.fundingType} onChange={set("fundingType")} placeholder="Externally / Internally Funded" />
            )}
          </>) : (<>
            <Row label="Count"         value={src.numPassengers} />
            <Row label="Names"         value={src.passengerNames?.split("\n").join(", ")} full />
            <Row label="Project Based" value={src.projectBased} />
            {src.projectBased === "Yes" && <Row label="Funding Type" value={src.fundingType} />}
          </>)}

        </div>

        {/* ── Footer: Actions ───────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">

          {/* Editing actions */}
          {editing ? (
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition disabled:opacity-60"
              >
                {saving ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save Changes</>
                )}
              </button>
            </div>
          ) : isApproved ? (
            /* Approved: only Download PDF */
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download as PDF
              </button>
            </div>
          ) : isPending ? (
            /* Pending: Edit + Close */
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-amber-900 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Request
              </button>
            </div>
          ) : (
            /* Rejected / other: just close */
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}