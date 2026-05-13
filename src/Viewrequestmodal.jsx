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

// ─── Section Header ───────────────────────────────────────────────────────────
const Section = ({ icon, title }) => (
  <div className="flex items-center gap-2 mt-5 mb-2">
    <span className="text-base leading-none">{icon}</span>
    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">{title}</span>
    <div className="flex-1 h-px bg-emerald-100" />
  </div>
);

// ─── Email Modal ──────────────────────────────────────────────────────────────
function SendEmailModal({ request, onClose }) {
  const [email, setEmail] = useState(request?.email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError("");

    // Build plain-text receipt body for email
    const body = `
VEHICLE REQUEST DETAILS
========================
Reference No : ${request?.referenceNo || "N/A"}
Status       : ${request?.status || "Pending"}
Submitted    : ${request?.timestamp || "—"}

REQUESTER INFORMATION
─────────────────────
Name         : ${request?.name || "—"}
Email        : ${request?.email || "—"}
Department   : ${request?.department || "—"}
Immediate Head: ${request?.immediateHead || "—"}
Mobile       : ${request?.mobile || "—"}

TRAVEL DETAILS
──────────────
Date         : ${request?.dateOfTravel || "—"}
Destination  : ${request?.destination || "—"}
Purpose      : ${request?.purpose || "—"}
Waiting Area : ${request?.waitingArea || "—"}
Departure    : ${fmt12(request?.departureTime)}
Return       : ${fmt12(request?.expectedReturn)}

PASSENGERS
──────────
Count        : ${request?.numPassengers || "—"}
Names        : ${request?.passengerNames || "—"}
Project Based: ${request?.projectBased || "—"}
${request?.projectBased === "Yes" ? `Funding Type : ${request?.fundingType || "—"}` : ""}

─────────────────────────────────────────
This is an automated receipt from the DNSC Vehicle Scheduling System.
    `.trim();

    // Using mailto as fallback (works without backend)
    // For production, replace with your email API (EmailJS, SendGrid, etc.)
    try {
      const subject = encodeURIComponent(`Vehicle Request Details – ${request?.name || ""} (${request?.dateOfTravel || ""})`);
      const encodedBody = encodeURIComponent(body);
      window.open(`mailto:${email}?subject=${subject}&body=${encodedBody}`, "_blank");
      setSent(true);
    } catch {
      setError("Could not open email client. Please copy the details manually.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Email Client Opened!</h3>
            <p className="text-xs text-slate-500 mb-4">Your default email app opened with the receipt pre-filled. Just hit Send.</p>
            <button onClick={onClose} className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-500 text-emerald-900 font-semibold text-sm rounded-xl transition">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Send Receipt by Email</h3>
                <p className="text-xs text-slate-400 mt-0.5">Opens your email app pre-filled</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Recipient Email</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700 bg-slate-50 placeholder-slate-400"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4">
              💡 This will open your device's email app with the receipt pre-filled. You'll just need to press <strong>Send</strong>.
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSend} disabled={sending} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition disabled:opacity-60 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Open Email App
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main: ViewRequestModal ───────────────────────────────────────────────────
export default function ViewRequestModal({ request, onClose }) {
  const [showEmail, setShowEmail] = useState(false);
  const receiptRef = useRef(null);

  if (!request) return null;

  const isApproved = request.status?.toLowerCase() === "approved";

  // ── Download receipt as HTML/print ──────────────────────────────────────────
  const handleDownload = () => {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Vehicle Request Details – ${request.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans', sans-serif; background: #f8fafc; color: #334155; padding: 40px 20px; }
  .receipt { max-width: 540px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #10b981; color: white; padding: 28px 32px; }
  .header h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .header p { font-size: 12px; opacity: 0.85; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 10px; }
  .badge.approved { background: #d1fae5; color: #065f46; }
  .badge.pending { background: #fef3c7; color: #92400e; }
  .badge.rejected { background: #fee2e2; color: #991b1b; }
  .body { padding: 28px 32px; }
  .ref { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #64748b; margin-bottom: 20px; padding: 10px 14px; background: #f1f5f9; border-radius: 8px; }
  .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #10b981; margin: 20px 0 8px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #d1fae5; }
  .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 7px 0; border-bottom: 1px dashed #e2e8f0; }
  .row:last-child { border: none; }
  .row .lbl { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; flex-shrink: 0; }
  .row .val { font-size: 12px; font-weight: 600; color: #334155; text-align: right; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 10px; color: #94a3b8; }
  @media print { body { padding: 0; background: white; } .receipt { box-shadow: none; border-radius: 0; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>🚗 Vehicle Request Details</h1>
    <p>DNSC Vehicle Scheduling System</p>
    <span class="badge ${(request.status || 'pending').toLowerCase()}">${request.status || 'Pending'}</span>
  </div>
  <div class="body">
    <div class="ref">REF # ${request.referenceNo || "N/A"} &nbsp;·&nbsp; Submitted: ${request.timestamp || "—"}</div>

    <div class="section-title">👤 Requester Info</div>
    <div class="row"><span class="lbl">Name</span><span class="val">${request.name || "—"}</span></div>
    <div class="row"><span class="lbl">Email</span><span class="val">${request.email || "—"}</span></div>
    <div class="row"><span class="lbl">Department</span><span class="val">${request.department || "—"}</span></div>
    <div class="row"><span class="lbl">Immediate Head</span><span class="val">${request.immediateHead || "—"}</span></div>
    <div class="row"><span class="lbl">Mobile</span><span class="val">${request.mobile || "—"}</span></div>

    <div class="section-title">✈️ Travel Details</div>
    <div class="row"><span class="lbl">Date</span><span class="val">${request.dateOfTravel || "—"}</span></div>
    <div class="row"><span class="lbl">Destination</span><span class="val">${request.destination || "—"}</span></div>
    <div class="row"><span class="lbl">Waiting Area</span><span class="val">${request.waitingArea || "—"}</span></div>
    <div class="row"><span class="lbl">Departure</span><span class="val">${fmt12(request.departureTime)}</span></div>
    <div class="row"><span class="lbl">Return</span><span class="val">${fmt12(request.expectedReturn)}</span></div>
    <div class="row"><span class="lbl">Purpose</span><span class="val">${request.purpose || "—"}</span></div>

    <div class="section-title">👥 Passengers</div>
    <div class="row"><span class="lbl">Count</span><span class="val">${request.numPassengers || "—"}</span></div>
    <div class="row"><span class="lbl">Names</span><span class="val">${(request.passengerNames || "—").replace(/\n/g, ", ")}</span></div>
    <div class="row"><span class="lbl">Project Based</span><span class="val">${request.projectBased || "—"}</span></div>
    ${request.projectBased === "Yes" ? `<div class="row"><span class="lbl">Funding Type</span><span class="val">${request.fundingType || "—"}</span></div>` : ""}
  </div>
  <div class="footer">Generated by DNSC Vehicle Scheduling System · This is an automated receipt.</div>
</div>
<script>window.print(); window.onafterprint = () => window.close();</script>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VehicleRequest_${request.name?.replace(/\s+/g, "_") || "Receipt"}_${request.dateOfTravel || "Date"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  }[request.status?.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-6 pb-5 rounded-t-2xl shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">Vehicle Request</p>
                <h2 className="text-white text-xl font-bold leading-tight">Receipt</h2>
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {request.timestamp && (
              <p className="text-emerald-200 text-[11px] mt-3 border-t border-emerald-400/40 pt-3">
                📅 Submitted: {request.timestamp}
              </p>
            )}
          </div>

          {/* ── Body / Receipt ───────────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-6 py-4" ref={receiptRef}>

            <Section icon="👤" title="Requester Info" />
            <Row label="Name" value={request.name} />
            <Row label="Email" value={request.email} />
            <Row label="Department" value={request.department} />
            <Row label="Immediate Head" value={request.immediateHead} />
            <Row label="Mobile" value={request.mobile} />

            <Section icon="✈️" title="Travel Details" />
            <Row label="Date of Travel" value={request.dateOfTravel} />
            <Row label="Destination" value={request.destination} />
            <Row label="Waiting Area" value={request.waitingArea} />
            <Row label="Departure" value={fmt12(request.departureTime)} />
            <Row label="Expected Return" value={fmt12(request.expectedReturn)} />
            <Row label="Purpose" value={request.purpose} full />

            <Section icon="👥" title="Passengers" />
            <Row label="Count" value={request.numPassengers} />
            <Row label="Names" value={request.passengerNames?.split("\n").join(", ")} full />
            <Row label="Project Based" value={request.projectBased} />
            {request.projectBased === "Yes" && (
              <Row label="Funding Type" value={request.fundingType} />
            )}

            {/* Approved banner */}
            {isApproved && (
              <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-emerald-800 text-xs font-bold">Request Approved!</p>
                  <p className="text-emerald-600 text-[11px]">This trip has been added to the schedule.</p>
                </div>
              </div>
            )}

            {/* Pending notice */}
            {!isApproved && request.status?.toLowerCase() !== "rejected" && (
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
                <span className="text-xl leading-none">⏳</span>
                <p className="text-amber-700 text-xs">Awaiting admin approval. You'll be notified once this is reviewed.</p>
              </div>
            )}
          </div>

          {/* ── Footer: Actions ──────────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-slate-100 shrink-0">
            {isApproved ? (
              <>
                <p className="text-[11px] text-slate-400 text-center mb-3 font-medium uppercase tracking-wider">Your request is approved — save a copy</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download
                  </button>
                  <button
                    onClick={() => setShowEmail(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Send to Email
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Draft
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email sub-modal */}
      {showEmail && <SendEmailModal request={request} onClose={() => setShowEmail(false)} />}
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HOW TO USE THIS IN YOUR REQUESTS TABLE / LIST:
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Import it:
//    import ViewRequestModal from "./ViewRequestModal";
//
// 2. Add state:
//    const [viewingRequest, setViewingRequest] = useState(null);
//
// 3. Add a "View" button in each table row:
//    <button onClick={() => setViewingRequest(row)}>
//      View
//    </button>
//
//    Where `row` is the request object with these fields:
//    { referenceNo, status, timestamp, email, name, department,
//      immediateHead, mobile, dateOfTravel, destination, purpose,
//      waitingArea, departureTime, expectedReturn, numPassengers,
//      passengerNames, projectBased, fundingType }
//
// 4. Render the modal:
//    {viewingRequest && (
//      <ViewRequestModal
//        request={viewingRequest}
//        onClose={() => setViewingRequest(null)}
//      />
//    )}