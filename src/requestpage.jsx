import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "./api";

const SHEETDB_URL = "https://sheetdb.io/api/v1/cyqjdv9avucvn";

const STATUS_STYLES = {
  Pending:  "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-rose-100 text-rose-800",
};

const TABS = ["Pending", "Approved", "Rejected"];

/* ── helpers ── */
const fmt = (val) => val || "—";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 shrink-0 w-36">{label}</span>
      <span className="text-xs text-slate-700 font-medium text-right">{fmt(value)}</span>
    </div>
  );
}

/* ── Request card ── */
function RequestCard({ req, onApprove, onReject, processing }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = req["STATUS"] === "Pending";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isPending ? "border-amber-200" : "border-slate-200"}`}>
      {/* Card header */}
      <div className="px-5 py-4 flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isPending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
          {(req["Name:"] || "?")[0]?.toUpperCase()}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-800 truncate">{req["Name:"] || "Unknown"}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[req["STATUS"]] || "bg-gray-100 text-gray-500"}`}>
              {req["STATUS"]}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{req["Department / Office"]} · {req["Timestamp"]}</div>
          <div className="flex gap-3 mt-2 text-xs text-slate-600 flex-wrap">
            <span>📍 {req["Travel Destination"]}</span>
            <span>📅 {req["Date of Travel"]}</span>
            <span>🕐 {req["Time of Departure"]}</span>
            <span>👥 {req["Number of Passengers"]} pax</span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-slate-300 hover:text-slate-500 transition mt-0.5 shrink-0"
          title={expanded ? "Collapse" : "See details"}
        >
          <svg className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <div>
              <InfoRow label="Email" value={req["Email"]} />
              <InfoRow label="Immediate Head" value={req["Immediate Head"]} />
              <InfoRow label="Mobile" value={req["Mobile Number"]} />
              <InfoRow label="Waiting Area" value={req["Waiting Area"]} />
              <InfoRow label="Expected Return" value={req["Expected Return"]} />
            </div>
            <div>
              <InfoRow label="Purpose" value={req["Purpose of Travel"]} />
              <InfoRow label="Passenger Names" value={req["Name of Passengers"]} />
              <InfoRow label="Project Based" value={req["Project Based Travel"]} />
              <InfoRow label="Funding Type" value={req["Funding Type"]} />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons — only for Pending */}
      {isPending && (
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-white">
          <button
            onClick={() => onReject(req)}
            disabled={processing === req["Timestamp"]}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕ Reject
          </button>
          <button
            onClick={() => onApprove(req)}
            disabled={processing === req["Timestamp"]}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {processing === req["Timestamp"] ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </>
            ) : (
              <>✓ Approve &amp; Create Trip</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [processing, setProcessing] = useState(null); // tracks which row is being processed
  const [tab, setTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* Fetch all rows from SheetDB */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHEETDB_URL);
      const data = await res.json();
      // SheetDB returns { data: [...] } or directly [...]
      const rows = Array.isArray(data) ? data : (data.data ?? []);
      // Sort newest first by Timestamp (rough sort — adjust if needed)
      setRequests(rows.reverse());
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  /* Update a SheetDB row's STATUS */
  const updateSheetStatus = async (req, newStatus) => {
    // SheetDB: PATCH /api/v1/{id}/column/value
    // We match on Timestamp as a unique-ish identifier
    const res = await fetch(
      `${SHEETDB_URL}/Timestamp/${encodeURIComponent(req["Timestamp"])}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { STATUS: newStatus } }),
      }
    );
    if (!res.ok) throw new Error("SheetDB update failed");
  };

  /* Approve: update sheet + create trip */
  const handleApprove = async (req) => {
    setProcessing(req["Timestamp"]);
    try {
      // 1. Build the remarks string
      const remarksLines = [
        `Purpose: ${req["Purpose of Travel"] || ""}`,
        `Waiting Area: ${req["Waiting Area"] || ""}`,
        `Passengers: ${req["Name of Passengers"] || ""}`,
        req["Project Based Travel"] === "Yes"
          ? `Project-based (${req["Funding Type"] || "unspecified funding"})`
          : null,
        `Contact: ${req["Mobile Number"] || ""}`,
        `Head: ${req["Immediate Head"] || ""}`,
        `Email: ${req["Email"] || ""}`,
      ].filter(Boolean).join(" | ");

      // 2. Create trip via your backend
      await apiFetch("/trips/", {
        method: "POST",
        body: JSON.stringify({
          vehicle: null,
          driver: null,
          status: "UPCOMING",
          destination: req["Travel Destination"] || "",
          date_of_trip: req["Date of Travel"] || null,
          time_of_travel: req["Time of Departure"]
            ? `${req["Time of Departure"]}:00`
            : null,
          date_requested: new Date().toISOString().slice(0, 10),
          requester: req["Department / Office"] || "",
          passengers: parseInt(req["Number of Passengers"], 10) || 0,
          remarks: remarksLines,
        }),
      });

      // 3. Update SheetDB status to Approved
      await updateSheetStatus(req, "Approved");

      // 4. Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r["Timestamp"] === req["Timestamp"] ? { ...r, STATUS: "Approved" } : r
        )
      );

      showToast("success", `Trip created for ${req["Name:"] || "requester"} on ${req["Date of Travel"]}.`);
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to approve request. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  /* Reject: update sheet only */
  const handleReject = async (req) => {
    if (!window.confirm(`Reject request from ${req["Name:"] || "this requester"}?`)) return;
    setProcessing(req["Timestamp"]);
    try {
      await updateSheetStatus(req, "Rejected");
      setRequests((prev) =>
        prev.map((r) =>
          r["Timestamp"] === req["Timestamp"] ? { ...r, STATUS: "Rejected" } : r
        )
      );
      showToast("success", "Request rejected.");
    } catch (e) {
      console.error(e);
      showToast("error", "Failed to reject request.");
    } finally {
      setProcessing(null);
    }
  };

  /* Filter by tab + search */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (r["STATUS"] !== tab) return false;
      if (!q) return true;
      return [r["Name:"], r["Department / Office"], r["Travel Destination"], r["Email"], r["Timestamp"]]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [requests, tab, search]);

  const counts = useMemo(() => {
    const c = { Pending: 0, Approved: 0, Rejected: 0 };
    requests.forEach((r) => { if (c[r["STATUS"]] !== undefined) c[r["STATUS"]]++; });
    return c;
  }, [requests]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        }`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Vehicle Requests</h1>
          <Link to="/home" className="text-sm text-slate-400 hover:text-slate-600 transition mt-0.5 inline-block">
            ← Back to Calendar
          </Link>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.582M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              tab === t
                ? t === "Pending"  ? "bg-amber-50 border-amber-300 text-amber-800"
                : t === "Approved" ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                :                    "bg-rose-50 border-rose-300 text-rose-800"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === t
                ? t === "Pending"  ? "bg-amber-200 text-amber-800"
                : t === "Approved" ? "bg-emerald-200 text-emerald-800"
                :                    "bg-rose-200 text-rose-800"
                : "bg-slate-100 text-slate-500"
            }`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-slate-400 text-slate-700 shadow-sm"
          placeholder="Search by name, department, destination…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3">
            {tab === "Pending" ? "🕐" : tab === "Approved" ? "✅" : "✕"}
          </div>
          <p className="text-sm font-medium">No {tab.toLowerCase()} requests</p>
          {tab === "Pending" && <p className="text-xs mt-1">All caught up!</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req, idx) => (
            <RequestCard
              key={req["Timestamp"] + idx}
              req={req}
              onApprove={handleApprove}
              onReject={handleReject}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
}