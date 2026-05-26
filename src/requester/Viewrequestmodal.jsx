import { useState, useEffect } from "react";
import { apiFetch } from "../api";

import { STATUS_CFG } from "../constants/statusConfig";
import { generateVehicleRequestPDF } from "../utils/generatePDF";

import RequestHeader from "../components/RequestHeader";
import AdminEditPanel from "../components/AdminEditPanel";
import ConfirmCancelDialog from "../components/ConfirmCancelDialog";
import { InfoField, EditField } from "../components/ui/fields";

// ─── Tiny shared primitives ────────────────────────────────────────────────────

const Spinner = () => (
  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────

/**
 * ViewRequestModal
 * Side-panel modal for viewing, editing (requester), and admin-reviewing a
 * vehicle request.
 *
 * @param {object}   request       - The request data object
 * @param {Function} onClose       - Called when the panel should close
 * @param {Function} onSave        - Called after a successful requester save/cancel
 * @param {Function} onAdminSave   - Called after a successful admin save
 * @param {boolean}  isAdmin       - Renders admin controls when true
 * @param {string}   initialMode   - "view" | "edit" | "adminEdit"
 */
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

  // ── Derived state ────────────────────────────────────────────────────────
  const status = (draft.status || "pending").toLowerCase();
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "disapproved" || status === "rejected";
  const isCancelled = status === "cancelled";

  const isEditing = mode === "edit";
  const isAdminEditing = mode === "adminEdit";

  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const src = draft;

  // Shorthand for updating a single key in draft
  const set = (key) => (val) => setDraft((d) => ({ ...d, [key]: val }));

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRequesterSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch(`/requests/${request.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: draft.name,
          department: draft.department,
          immediate_head: draft.immediateHead,
          mobile: draft.mobile,
          date_of_travel: draft.dateOfTravel,
          destination: draft.destination,
          purpose: draft.purpose,
          waiting_area: draft.waitingArea,
          time_of_departure: draft.departureTime,
          expected_return: draft.expectedReturn,
          passengers: draft.numPassengers ? parseInt(draft.numPassengers, 10) : 0,
          passenger_names: draft.passengerNames,
          project_based:
            draft.projectBased === "Yes"
              ? true
              : draft.projectBased === "No"
              ? false
              : null,
          funding_type:
            draft.projectBased === "Yes" ? draft.fundingType || "" : "",
        },
        { auth: false}
      ),
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
      const normalizedDraft = {
        ...draft,
        status: (draft.status || "pending").toLowerCase(),
      };
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
      await apiFetch(`/requests/${request.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      },
      {auth: false}
    );
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      onClick={onClose}
    >
      {/* Dim overlay */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cancel confirm overlay */}
        {showCancelDialog && (
          <ConfirmCancelDialog
            onConfirm={handleCancelRequest}
            onDismiss={() => setShowCancelDialog(false)}
            loading={cancelling}
          />
        )}

        {/* ── Header ── */}
        <RequestHeader
          request={src}
          status={status}
          isPending={isPending}
          onClose={onClose}
          onDownloadPDF={() => generateVehicleRequestPDF(src, status)}
        />

        {/* ── Body (scrollable) ── */}
        <div className="px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Status alerts */}
          {isApproved && (src.vehicle || src.driver) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-800 mb-2">
                Request approved — trip scheduled
              </p>
              <div className="grid grid-cols-2 gap-2">
                {src.vehicle && (
                  <div className="bg-white rounded-lg border border-emerald-100 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">
                      Vehicle
                    </p>
                    <p className="text-xs font-semibold text-emerald-700">{src.vehicle}</p>
                  </div>
                )}
                {src.driver && (
                  <div className="bg-white rounded-lg border border-emerald-100 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">
                      Driver
                    </p>
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

          {/* Admin remarks (view mode) */}
          {!isAdminEditing && src.adminRemarks && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-3">
              <p className="text-[9px] uppercase tracking-widest text-blue-400 font-semibold mb-1">
                Admin Remarks
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">{src.adminRemarks}</p>
            </div>
          )}

          {/* Admin edit panel */}
          {isAdminEditing && (
            <AdminEditPanel draft={draft} setDraft={setDraft} />
          )}

          {/* General info */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-3">General info</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {isEditing ? (
                <>
                  <EditField label="Name"           value={draft.name}           onChange={set("name")}           placeholder="Full name" />
                  <EditField label="Mobile"         value={draft.mobile}         onChange={set("mobile")}         placeholder="09xx-xxx-xxxx" />
                  <EditField label="Department"     value={draft.department}     onChange={set("department")}     placeholder="Department / Office" />
                  <EditField label="Immediate Head" value={draft.immediateHead}  onChange={set("immediateHead")}  placeholder="Supervisor name" />
                  <EditField label="Date of Travel" value={draft.dateOfTravel}   onChange={set("dateOfTravel")}   type="date" />
                  <EditField label="Waiting Area"   value={draft.waitingArea}    onChange={set("waitingArea")}    placeholder="e.g. Main Gate" />
                  <EditField label="Departure"      value={draft.departureTime}  onChange={set("departureTime")}  type="time" />
                  <EditField label="Return"         value={draft.expectedReturn} onChange={set("expectedReturn")} type="time" />
                  <EditField label="Passengers"     value={draft.numPassengers}  onChange={set("numPassengers")}  type="number" placeholder="Count" />
                  <EditField label="Project Based"  value={draft.projectBased}   onChange={set("projectBased")}   placeholder="Yes / No" />
                  <EditField label="Purpose"         value={draft.purpose}        onChange={set("purpose")}        type="textarea" placeholder="Purpose of travel" full />
                  <EditField label="Passenger Names" value={draft.passengerNames} onChange={set("passengerNames")} type="textarea" placeholder="One per line" full />
                  {draft.projectBased === "Yes" && (
                    <EditField label="Funding Type" value={draft.fundingType} onChange={set("fundingType")} placeholder="Externally / Internally Funded" full />
                  )}
                </>
              ) : (
                <>
                  <InfoField label="Full name"      value={src.name} />
                  <InfoField label="Mobile number"  value={src.mobile} />
                  <InfoField label="Department"     value={src.department} />
                  <InfoField label="Immediate head" value={src.immediateHead} />
                  <InfoField label="Email"          value={src.email} />
                  <InfoField label="Passengers"     value={src.numPassengers ? `${src.numPassengers} pax` : "—"} />
                  <InfoField
                    label="Project based"
                    value={
                      src.projectBased === "Yes"
                        ? `Yes${src.fundingType ? ` — ${src.fundingType}` : ""}`
                        : src.projectBased
                    }
                  />
                  <InfoField label="Waiting area"   value={src.waitingArea} />
                  <InfoField label="Purpose"        value={src.purpose} full />
                  {src.passengerNames && (
                    <InfoField
                      label="Passenger names"
                      value={src.passengerNames.split("\n").join(", ")}
                      full
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pt-3 pb-5 border-t border-slate-100 flex flex-col gap-2 shrink-0">

          {/* Save / Discard row (edit modes) */}
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
                {saving ? <><Spinner /> Saving…</> : "Save Changes"}
              </button>
            </div>
          )}

          {/* View mode footer */}
          {mode === "view" && (
            <>
              <div className="flex gap-2">
                {/* Admin: edit button */}
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
  );
}