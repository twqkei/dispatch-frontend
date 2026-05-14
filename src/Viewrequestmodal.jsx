import { useState, useEffect } from "react";

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ─── Row Components ───────────────────────────────────────────────────────────
const Row = ({ label, value, full }) => (
  <div className={`flex ${full ? "flex-col gap-0.5" : "justify-between items-start gap-4"} py-2 border-b border-dashed border-slate-100 last:border-0`}>
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">{label}</span>
    <span className={`text-xs font-medium text-slate-700 ${full ? "leading-relaxed" : "text-right max-w-[55%]"}`}>{value || "—"}</span>
  </div>
);

const EditRow = ({ label, value, onChange, type = "text", full, placeholder }) => (
  <div className={`flex ${full ? "flex-col gap-1" : "justify-between items-start gap-4"} py-2 border-b border-dashed border-slate-100 last:border-0`}>
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">{label}</span>
    {type === "textarea" ? (
      <textarea
        rows={3}
        className="text-xs font-medium text-slate-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        className={`text-xs font-medium text-slate-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 ${full ? "w-full" : "text-right w-40"}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

const Section = ({ icon, title }) => (
  <div className="flex items-center gap-2 mt-5 mb-1.5">
    <span className="text-sm leading-none">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{title}</span>
    <div className="flex-1 h-px bg-blue-100" />
  </div>
);

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  approved:    { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Approved" },
  pending:     { bg: "bg-amber-100 text-amber-700 border-amber-200",       label: "Pending" },
  disapproved: { bg: "bg-red-100 text-red-700 border-red-200",             label: "Disapproved" },
  rejected:    { bg: "bg-red-100 text-red-700 border-red-200",             label: "Rejected" },
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ViewRequestModal({
  request,
  onClose,
  onSave,          // requester save (SheetDB)
  onAdminSave,     // admin save (apiFetch PATCH)
  isAdmin = false,
  initialMode = "view",
}) {
  const [mode, setMode]     = useState(initialMode); // 'view' | 'edit' | 'adminEdit'
  const [draft, setDraft]   = useState({ ...request });
  const [saving, setSaving] = useState(false);

  // Keep draft in sync if parent updates the request prop (e.g. status changed from table)
  useEffect(() => {
    setDraft({ ...request });
  }, [request]);

  if (!request) return null;

  const status     = (draft.status || "").toLowerCase();
  const isPending  = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "disapproved" || status === "rejected";

  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  const statusCfg = STATUS_CFG[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", label: draft.status || "Pending" };

  // ── Requester save (SheetDB) ────────────────────────────────────────────────
  const handleRequesterSave = async () => {
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
      setMode("view");
      onSave && onSave(draft);
    } catch (e) {
      alert("Failed to save. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── Admin save ──────────────────────────────────────────────────────────────
  const handleAdminSave = async () => {
    setSaving(true);
    try {
      await onAdminSave?.(draft);
      setMode("view");
    } catch (e) {
      alert("Failed to save admin changes.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ── PDF Download ────────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const src = draft;
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Vehicle Request – ${src.name || "Request"}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  @page{size:A4;margin:24mm 20mm}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:white;font-size:12px}
  .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:16px;border-bottom:2px solid #3b82f6;margin-bottom:20px}
  .header-left h1{font-size:18px;font-weight:700;color:#1d4ed8;margin-bottom:2px}
  .header-left p{font-size:10px;color:#64748b}
  .header-right{text-align:right}
  .ref{font-family:monospace;font-size:10px;color:#64748b;margin-bottom:4px}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
  .badge.approved{background:#d1fae5;color:#065f46;border:1px solid #6ee7b7}
  .badge.pending{background:#fef3c7;color:#92400e;border:1px solid #fcd34d}
  .badge.disapproved,.badge.rejected{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}
  .section{margin-top:18px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
  .section-title{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3b82f6;white-space:nowrap}
  .section-line{flex:1;height:1px;background:#dbeafe}
  table{width:100%;border-collapse:collapse}
  td{padding:5px 4px;font-size:11px;border-bottom:1px dashed #e2e8f0;vertical-align:top}
  td.lbl{color:#94a3b8;font-weight:600;text-transform:uppercase;font-size:9.5px;letter-spacing:.06em;width:38%;white-space:nowrap;padding-right:12px}
  td.val{color:#1e293b;font-weight:500}
  .remarks-box{margin-top:18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px}
  .remarks-box h3{color:#1d4ed8;font-size:11px;font-weight:700;margin-bottom:4px}
  .remarks-box p{color:#1e40af;font-size:10px;line-height:1.6}
  .approved-box{margin-top:18px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:12px 16px}
  .approved-box h3{color:#065f46;font-size:11px;font-weight:700;margin-bottom:4px}
  .assigned-row{display:flex;gap:24px;margin-top:8px}
  .assigned-item label{font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700;letter-spacing:.08em;display:block}
  .assigned-item span{font-size:12px;font-weight:700;color:#065f46}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:9px;color:#94a3b8}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
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
    <span class="badge ${status}">${src.status || "Pending"}</span>
  </div>
</div>

<div class="section"><span class="section-title">👤 Requester Information</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Name</td><td class="val">${src.name||"—"}</td></tr>
  <tr><td class="lbl">Email</td><td class="val">${src.email||"—"}</td></tr>
  <tr><td class="lbl">Department</td><td class="val">${src.department||"—"}</td></tr>
  <tr><td class="lbl">Immediate Head</td><td class="val">${src.immediateHead||"—"}</td></tr>
  <tr><td class="lbl">Mobile</td><td class="val">${src.mobile||"—"}</td></tr>
</table>

<div class="section"><span class="section-title">✈️ Travel Details</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Date of Travel</td><td class="val">${src.dateOfTravel||"—"}</td></tr>
  <tr><td class="lbl">Destination</td><td class="val">${src.destination||"—"}</td></tr>
  <tr><td class="lbl">Waiting Area</td><td class="val">${src.waitingArea||"—"}</td></tr>
  <tr><td class="lbl">Departure</td><td class="val">${fmt12(src.departureTime)}</td></tr>
  <tr><td class="lbl">Expected Return</td><td class="val">${fmt12(src.expectedReturn)}</td></tr>
  <tr><td class="lbl">Purpose</td><td class="val">${src.purpose||"—"}</td></tr>
</table>

<div class="section"><span class="section-title">👥 Passengers</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Count</td><td class="val">${src.numPassengers||"—"}</td></tr>
  <tr><td class="lbl">Names</td><td class="val">${(src.passengerNames||"—").replace(/\n/g,", ")}</td></tr>
  <tr><td class="lbl">Project Based</td><td class="val">${src.projectBased||"—"}</td></tr>
  ${src.projectBased==="Yes"?`<tr><td class="lbl">Funding Type</td><td class="val">${src.fundingType||"—"}</td></tr>`:""}
</table>

${src.adminRemarks ? `
<div class="remarks-box">
  <h3>📝 Admin Remarks</h3>
  <p>${src.adminRemarks}</p>
</div>` : ""}

${isApproved && (src.driver || src.vehicle) ? `
<div class="approved-box">
  <h3>✅ Request Approved</h3>
  <p>This trip has been officially approved and added to the schedule.</p>
  <div class="assigned-row">
    ${src.vehicle ? `<div class="assigned-item"><label>Vehicle</label><span>${src.vehicle}</span></div>` : ""}
    ${src.driver  ? `<div class="assigned-item"><label>Driver</label><span>${src.driver}</span></div>`  : ""}
  </div>
</div>` : ""}

<div class="footer">Generated by DNSC Vehicle Scheduling System &nbsp;·&nbsp; Official vehicle request document.</div>
<script>window.onload=function(){window.print()}</script>
</body>
</html>`;
    const blob = new Blob([content], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) alert("Please allow pop-ups to download the PDF.");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const isEditing      = mode === "edit";
  const isAdminEditing = mode === "adminEdit";
  const src = draft; // always display draft so changes reflect immediately

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Modal Header ── */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-6 pt-6 pb-5 rounded-t-2xl shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">DNSC Motor Pool</p>
              <h2 className="text-white text-xl font-bold leading-tight">Vehicle Request</h2>
              {request.referenceNo && (
                <p className="text-blue-200 text-[11px] mt-0.5 font-mono">REF # {request.referenceNo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Live status badge — reads from draft so it updates when admin edits */}
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusCfg.bg}`}>
                {statusCfg.label}
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
            <p className="text-blue-200 text-[11px] mt-3 border-t border-blue-400/30 pt-3">
              📅 Submitted: {request.timestamp}
            </p>
          )}
        </div>

        {/* ── Mode banners ── */}
        {isEditing && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 shrink-0">
            <span className="text-amber-500 text-sm">✏️</span>
            <span className="text-xs text-amber-700 font-medium">Editing request — requester info will be updated</span>
          </div>
        )}
        {isAdminEditing && (
          <div className="bg-blue-50 border-b border-blue-200 px-5 py-2.5 flex items-center gap-2 shrink-0">
            <span className="text-blue-500 text-sm">🛡</span>
            <span className="text-xs text-blue-700 font-medium">Admin edit — you can update status and add remarks</span>
          </div>
        )}

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Status banners */}
          {isApproved && (src.vehicle || src.driver) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
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
                {src.vehicle && (
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Vehicle</p>
                    <p className="text-sm font-bold text-emerald-700">{src.vehicle}</p>
                  </div>
                )}
                {src.driver && (
                  <div className="bg-white rounded-lg border border-emerald-200 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Driver</p>
                    <p className="text-sm font-bold text-emerald-700">{src.driver}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {isPending && !isEditing && !isAdminEditing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-3 flex items-center gap-3">
              <span className="text-xl">⏳</span>
              <p className="text-amber-700 text-xs">Awaiting admin approval.</p>
            </div>
          )}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-3 flex items-center gap-3">
              <span className="text-xl">✕</span>
              <p className="text-red-700 text-xs">This request was not approved. Contact admin for details.</p>
            </div>
          )}

          {/* ── Admin Remarks (display) ── */}
          {!isAdminEditing && src.adminRemarks && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">📝 Admin Remarks</p>
              <p className="text-xs text-blue-800 leading-relaxed">{src.adminRemarks}</p>
            </div>
          )}

          {/* ── Admin Edit Panel ── */}
          {isAdminEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3 flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">🛡 Admin Controls</p>

              {/* Status override */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Update Status</label>
                <select
                  value={draft.status || "PENDING"}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                  className="text-xs font-semibold border border-blue-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DISAPPROVED">Disapproved</option>
                </select>
              </div>

              {/* Admin remarks */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks / Notes</label>
                <textarea
                  rows={4}
                  className="text-xs text-slate-700 bg-white border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none leading-relaxed"
                  placeholder="Add remarks, reason for approval/disapproval, special instructions…"
                  value={draft.adminRemarks || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, adminRemarks: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* ── Requester Info ── */}
          <Section icon="👤" title="Requester Info" />
          {isEditing ? (<>
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
          {isEditing ? (<>
            <EditRow label="Date of Travel"  value={draft.dateOfTravel}   onChange={set("dateOfTravel")}   type="date" />
            <EditRow label="Destination"     value={draft.destination}    onChange={set("destination")}    placeholder="e.g. Manila, NCR" />
            <EditRow label="Purpose"         value={draft.purpose}        onChange={set("purpose")}        type="textarea" placeholder="Purpose of travel" full />
            <EditRow label="Waiting Area"    value={draft.waitingArea}    onChange={set("waitingArea")}    placeholder="e.g. Main Gate" />
            <EditRow label="Departure"       value={draft.departureTime}  onChange={set("departureTime")}  type="time" />
            <EditRow label="Return"          value={draft.expectedReturn} onChange={set("expectedReturn")} type="time" />
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
          {isEditing ? (<>
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

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">

          {/* Requester edit mode */}
          {isEditing && (
            <div className="flex gap-3">
              <button onClick={() => { setDraft({ ...request }); setMode("view"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleRequesterSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-amber-900 transition disabled:opacity-60">
                {saving
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save Changes</>
                }
              </button>
            </div>
          )}

          {/* Admin edit mode */}
          {isAdminEditing && (
            <div className="flex gap-3">
              <button onClick={() => { setDraft({ ...request }); setMode("view"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleAdminSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-60">
                {saving
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Save Admin Changes</>
                }
              </button>
            </div>
          )}

          {/* View mode */}
          {mode === "view" && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition min-w-[80px]">
                Close
              </button>
              {isAdmin && (
                <button onClick={() => setMode("adminEdit")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition min-w-[100px]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Edit
                </button>
              )}
              {isPending && !isAdmin && (
                <button onClick={() => setMode("edit")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-amber-900 transition min-w-[100px]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Request
                </button>
              )}
              <button onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition min-w-[120px]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}