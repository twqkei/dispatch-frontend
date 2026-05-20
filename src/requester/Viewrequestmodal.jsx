import { useState, useEffect } from "react";
import { apiFetch } from "../api";

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoField = ({ label, value, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
  </div>
);

const EditField = ({ label, value, onChange, type = "text", placeholder, full }) => (
  <div className={full ? "col-span-2" : ""}>
    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">{label}</p>
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

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  approved:    { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
  pending:     { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",       label: "Pending" },
  disapproved: { dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",             label: "Disapproved" },
  rejected:    { dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",             label: "Rejected" },
  cancelled:   { dot: "bg-slate-300",   badge: "bg-slate-100 text-slate-500 border-slate-200",      label: "Cancelled" },
};

// ─── Confirm Cancel Dialog ────────────────────────────────────────────────────
function ConfirmCancelDialog({ onConfirm, onDismiss, loading }) {
  return (
    <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-6 rounded-2xl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 flex flex-col gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Cancel this request?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">This cannot be undone. The request will be marked as cancelled.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onDismiss} disabled={loading} className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition">
            Keep it
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60">
            {loading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ─── Icon: Download ───────────────────────────────────────────────────────────
const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ViewRequestModal({
  request,
  onClose,
  onSave,
  onAdminSave,
  isAdmin = false,
  initialMode = "view",
}) {
  const [mode, setMode] = useState(initialMode);
  const [draft, setDraft] = useState({ ...request });
  const [saving, setSaving] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setDraft({ ...request });
    setMode(initialMode);
  }, [request, initialMode]);

  if (!request) return null;

  const status = (draft.status || "pending").toLowerCase();
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "disapproved" || status === "rejected";
  const isCancelled = status === "cancelled";

  const isEditing = mode === "edit";
  const isAdminEditing = mode === "adminEdit";

  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;

  const set = (key) => (val) =>
    setDraft((d) => ({
      ...d,
      [key]: val,
    }));

  const src = draft;


  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRequesterSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/requests/${request.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: draft.name, department: draft.department,
          immediate_head: draft.immediateHead, mobile: draft.mobile,
          date_of_travel: draft.dateOfTravel, destination: draft.destination,
          purpose: draft.purpose, waiting_area: draft.waitingArea,
          time_of_departure: draft.departureTime, expected_return: draft.expectedReturn,
          passengers: draft.numPassengers ? parseInt(draft.numPassengers, 10) : 0,
          passenger_names: draft.passengerNames,
          project_based: draft.projectBased === "Yes" ? true : draft.projectBased === "No" ? false : null,
          funding_type: draft.projectBased === "Yes" ? (draft.fundingType || "") : "",
        }),
      });
      setMode("view");
      onSave?.({ ...draft, ...updated });
    } catch {
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSave = async () => {
    setSaving(true);
    try {
      const normalizedDraft = { ...draft, status: (draft.status || "pending").toLowerCase() };
      await onAdminSave?.(normalizedDraft);
      setDraft(normalizedDraft);
      setMode("view");
    } catch {
      alert("Failed to save admin changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    setCancelling(true);
    try {
      await apiFetch(`/requests/${request.id}/`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
      const updated = { ...draft, status: "cancelled" };
      setDraft(updated);
      setShowCancelDialog(false);
      onSave?.(updated);
    } catch {
      alert("Failed to cancel request.");
    } finally {
      setCancelling(false);
    }
  };

  // remove the old handleDownloadPDF function entirely, replace with:
  const [downloadingTicket, setDownloadingTicket] = useState(false);

  const handleDownloadTripTicket = async () => {
    setDownloadingTicket(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/ticket/`, {
        method: "GET",
        headers: {
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `trip_ticket_${request.referenceNo || request.id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate trip ticket. Please try again.");
    } finally {
      setDownloadingTicket(false);
    }
  };

  return (
    <>
      {/* ── Backdrop — slides in from the right like the reference UI ── */}
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-end"
        onClick={onClose}
      >
        {/* Dim left side */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm" />

        {/* Panel */}
        <div
          className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cancel confirm overlaid inside the panel */}
          {showCancelDialog && (
            <ConfirmCancelDialog
              onConfirm={handleCancelRequest}
              onDismiss={() => setShowCancelDialog(false)}
              loading={cancelling}
            />
          )}

          {/* ── Header ── */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">

            {/* Top row: ref ID · chip · PDF · X */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-400 shrink-0">Reservation ID</span>
              <span className="text-sm font-bold text-slate-900 shrink-0">
                {src.referenceNo ? `#${src.referenceNo}` : "#—"}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 shrink-0">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 6l-4 10h10L13 6z" />
                </svg>
                Vehicle Request
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Download PDF button */}
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1.5 transition shrink-0"
              >
                <IconDownload className="w-3.5 h-3.5" />
                Download PDF
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Requester row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(src.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Requester name</p>
                <p className="text-[15px] font-semibold text-slate-900 truncate">{src.name || "—"}</p>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${cfg.badge} shrink-0`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            </div>

            {/* Submitted banner */}
            {src.timestamp && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submitted: {src.timestamp}
                {isPending && (
                  <span className="ml-auto text-blue-500 font-medium cursor-pointer hover:underline">Expedite</span>
                )}
              </div>
            )}

            {/* Trip summary tiles */}
            <div className="grid grid-cols-3 mt-3 border border-slate-100 rounded-xl overflow-hidden divide-x divide-slate-100">
              {[
                {
                  path: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                  label: "Destination",
                  value: src.destination || "—",
                },
                {
                  path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  label: "Date & Time",
                  value: src.dateOfTravel
                    ? `${src.dateOfTravel}\n${fmt12(src.departureTime)} – ${fmt12(src.expectedReturn)}`
                    : "—",
                },
                {
                  path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  label: "Driver",
                  value: src.driver || "Unassigned",
                },
              ].map(({ path, label, value }) => (
                <div key={label} className="px-3 py-3 bg-slate-50/60">
                  <div className="flex items-center gap-1 mb-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                    </svg>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{label}</p>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Body (scrollable) ── */}
          <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1">

            {/* Status alerts */}
            {isApproved && (src.vehicle || src.driver) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-800 mb-2">Request approved — trip scheduled</p>
                <div className="grid grid-cols-2 gap-2">
                  {src.vehicle && (
                    <div className="bg-white rounded-lg border border-emerald-100 px-3 py-2">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Vehicle</p>
                      <p className="text-xs font-semibold text-emerald-700">{src.vehicle}</p>
                    </div>
                  )}
                  {src.driver && (
                    <div className="bg-white rounded-lg border border-emerald-100 px-3 py-2">
                      <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Driver</p>
                      <p className="text-xs font-semibold text-emerald-700">{src.driver}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                <p className="font-semibold mb-0.5">Request not approved</p>
                <p className="text-red-500">Contact the admin for more details.</p>
              </div>
            )}

            {isCancelled && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <p className="font-semibold mb-0.5">Request cancelled</p>
                <p className="text-slate-400">This request was cancelled by the requester.</p>
              </div>
            )}

            {/* Admin remarks */}
            {!isAdminEditing && src.adminRemarks && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-3">
                <p className="text-[9px] uppercase tracking-widest text-blue-400 font-semibold mb-1">Admin Remarks</p>
                <p className="text-xs text-blue-800 leading-relaxed">{src.adminRemarks}</p>
              </div>
            )}

            {/* Admin edit panel */}
            {isAdminEditing && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin controls</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Status</p>
                    <select
                      value={(draft.status || "pending").toLowerCase()}
                      onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="disapproved">Disapproved</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Vehicle</p>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="e.g. Toyota Hi-Ace"
                      value={draft.vehicle || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, vehicle: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Driver</p>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Driver name"
                      value={draft.driver || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, driver: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Remarks</p>
                    <textarea
                      rows={3}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      placeholder="Approval notes, instructions…"
                      value={draft.adminRemarks || ""}
                      onChange={(e) => setDraft((d) => ({ ...d, adminRemarks: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* General info */}
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-3">General info</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {isEditing ? (
                  <>
                    <EditField label="Name"            value={draft.name}           onChange={set("name")}           placeholder="Full name" />
                    <EditField label="Mobile"          value={draft.mobile}         onChange={set("mobile")}         placeholder="09xx-xxx-xxxx" />
                    <EditField label="Department"      value={draft.department}     onChange={set("department")}     placeholder="Department / Office" />
                    <EditField label="Immediate Head"  value={draft.immediateHead}  onChange={set("immediateHead")}  placeholder="Supervisor name" />
                    <EditField label="Date of Travel"  value={draft.dateOfTravel}   onChange={set("dateOfTravel")}   type="date" />
                    <EditField label="Waiting Area"    value={draft.waitingArea}    onChange={set("waitingArea")}    placeholder="e.g. Main Gate" />
                    <EditField label="Departure"       value={draft.departureTime}  onChange={set("departureTime")}  type="time" />
                    <EditField label="Return"          value={draft.expectedReturn} onChange={set("expectedReturn")} type="time" />
                    <EditField label="Passengers"      value={draft.numPassengers}  onChange={set("numPassengers")}  type="number" placeholder="Count" />
                    <EditField label="Project Based"   value={draft.projectBased}   onChange={set("projectBased")}   placeholder="Yes / No" />
                    <EditField label="Purpose"         value={draft.purpose}        onChange={set("purpose")}        type="textarea" placeholder="Purpose of travel" full />
                    <EditField label="Passenger Names" value={draft.passengerNames} onChange={set("passengerNames")} type="textarea" placeholder="One per line" full />
                    {draft.projectBased === "Yes" && (
                      <EditField label="Funding Type" value={draft.fundingType} onChange={set("fundingType")} placeholder="Externally / Internally Funded" full />
                    )}
                  </>
                ) : (
                  <>
                    <InfoField label="Full name"       value={src.name} />
                    <InfoField label="Mobile number"   value={src.mobile} />
                    <InfoField label="Department"      value={src.department} />
                    <InfoField label="Immediate head"  value={src.immediateHead} />
                    <InfoField label="Email"           value={src.email} />
                    <InfoField label="Passengers"      value={src.numPassengers ? `${src.numPassengers} pax` : "—"} />
                    <InfoField label="Project based"   value={src.projectBased === "Yes" ? `Yes${src.fundingType ? ` — ${src.fundingType}` : ""}` : src.projectBased} />
                    <InfoField label="Waiting area"    value={src.waitingArea} />
                    <InfoField label="Purpose"         value={src.purpose} full />
                    {src.passengerNames && (
                      <InfoField label="Passenger names" value={src.passengerNames.split("\n").join(", ")} full />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pt-3 pb-5 border-t border-slate-100 flex flex-col gap-2 shrink-0">

            {/* Edit / Admin-edit save row */}
            {(isEditing || isAdminEditing) && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setDraft({ ...request }); setMode("view"); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Discard
                </button>
                <button
                  onClick={isAdminEditing ? handleAdminSave : handleRequesterSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-60"
                >
                  {saving ? <><Spinner />Saving…</> : "Save Changes"}
                </button>
              </div>
            )}

            {/* View mode footer */}
            {mode === "view" && (
              <>
                {/* Primary action row */}
                <div className="flex gap-2">
                  {/* Admin: review/edit */}
                  {isAdmin && (
                    <button
                      onClick={() => setMode("adminEdit")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Request
                    </button>
                  )}

                  {/* Requester pending: edit */}
                  {isPending && !isAdmin && (
                    <button
                      onClick={() => setMode("edit")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Request
                    </button>
                  )}

                  {/* Requester pending: cancel */}
                  {isPending && !isAdmin && (
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Request
                    </button>
                  )}
                </div>

                <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isPending
                    ? "Please wait for admin approval"
                    : isCancelled
                    ? "This request has been cancelled"
                    : `Request is ${cfg.label.toLowerCase()}`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}