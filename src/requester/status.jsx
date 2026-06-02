import { useEffect, useState } from "react";
import ViewRequestModal from "./Viewrequestmodal";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

// ─── Status helpers ───────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  switch ((status || "").toUpperCase()) {
    case "APPROVED":
      return { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Approved" };
    case "PENDING":
      return { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", label: "Pending" };
    case "DISAPPROVED":
      return { dot: "bg-red-400", badge: "bg-red-50 text-red-700 ring-1 ring-red-200", label: "Disapproved" };
    default:
      return { dot: "bg-gray-300", badge: "bg-gray-50 text-gray-600 ring-1 ring-gray-200", label: status || "—" };
  }
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Ref Verify Modal ─────────────────────────────────────────────────────────
function RefVerifyModal({ onConfirm, onCancel }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const normalized = input.trim().toUpperCase();
    onConfirm(normalized, (matched) => {
      if (!matched) {
        setError(true);
        setInput("");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Verify Your Reference Number</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter the reference number from your request confirmation to view details.</p>
          </div>
        </div>

        {/* Input */}
        <input
          autoFocus
          type="text"
          placeholder="e.g. VR-0001"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 placeholder-slate-400 font-mono tracking-wide transition
            ${error
              ? "border-red-300 bg-red-50 text-red-700 focus:ring-red-200"
              : "border-slate-200 bg-slate-50 text-slate-800 focus:ring-emerald-200 focus:border-emerald-300"
            }`}
        />

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Reference number not found. Please check and try again.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-10 h-14 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">Motor Pool Services Unit</p>
          <p className="text-[10px] text-slate-400 hidden sm:block">Davao del Norte State College</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/request"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Submit Request</span>
          <span className="sm:hidden">Submit</span>
        </Link>
        <a
          href="/login"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin Login</span>
          <span className="sm:hidden">Login</span>
        </a>
      </div>
    </header>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const ALL_STATUSES = ["All", "PENDING", "APPROVED", "DISAPPROVED"];

export default function RequestStatus() {
  const [data, setData]                   = useState([]);
  const [drivers, setDrivers]             = useState([]);
  const [vehicles, setVehicles]           = useState([]);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [loading, setLoading]             = useState(true);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [verifyTarget, setVerifyTarget]   = useState(null); // request pending verification

  const fetchData = async () => {
    setLoading(true);
    try {
      const [requests, driverList, vehicleList] = await Promise.all([
        apiFetch("/requests/"),
        apiFetch("/drivers/"),
        apiFetch("/vehicles/"),
      ]);
      const sorted = [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setData(sorted);
      setDrivers(driverList.map((d) => ({ id: d.id, label: d.name })));
      setVehicles(vehicleList.map((v) => ({ id: v.id, label: `${v.plate_number} — ${v.model}` })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = data.filter((item) => {
    const name   = (item.name || "").toLowerCase();
    const dest   = (item.destination || "").toLowerCase();
    const status = item.status || "";
    const matchesSearch = name.includes(search.toLowerCase()) || dest.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const buildRequest = (item) => ({
    id:             item.id,
    referenceNo:    `VR-${String(item.id).padStart(4, "0")}`,
    status:         item.status,
    timestamp:      item.created_at,
    email:          item.email,
    name:           item.name,
    department:     item.department,
    immediateHead:  item.immediate_head,
    mobile:         item.mobile,
    dateOfTravel:   item.date_of_travel,
    dateOfReturn:   item.date_returned,
    destination:    item.destination,
    purpose:        item.purpose,
    waitingArea:    item.waiting_area,
    departureTime:  item.time_of_departure,
    expectedReturn: item.expected_return,
    numPassengers:  item.passengers,
    passengerNames: item.passenger_names,
    projectBased:   item.project_based ? "Yes" : "No",
    fundingType:    item.funding_type,
    driver:         drivers.find((d) => d.id === item.driver)?.label || "—",
    vehicle:        vehicles.find((v) => v.id === item.vehicle)?.label || "—",
    adminRemarks:   item.admin_remarks || "",
  });

  // Called when user clicks "View" — opens the ref verify prompt
  const handleViewClick = (item) => {
    setVerifyTarget(buildRequest(item));
  };

  // Called when user submits a ref number in the verify modal
  const handleVerifyConfirm = (entered, callback) => {
    if (entered === verifyTarget.referenceNo) {
      setViewingRequest(verifyTarget);
      setVerifyTarget(null);
    } else {
      callback(false); // triggers error state inside modal
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Topbar />

      <div className="flex-1 p-6">

        {/* ── Ref verify prompt ── */}
        {verifyTarget && (
          <RefVerifyModal
            onConfirm={handleVerifyConfirm}
            onCancel={() => setVerifyTarget(null)}
          />
        )}

        {/* ── Request details modal ── */}
        {viewingRequest && (
          <ViewRequestModal
            request={viewingRequest}
            onClose={() => setViewingRequest(null)}
            isAdmin={false}
          />
        )}

        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Travel Requests</h1>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search name or destination…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 placeholder-slate-400 text-slate-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-700"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Status" : getStatusConfig(s).label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {["#", "Date of Request", "Name", "Date of Travel", "Destination", "Purpose", "Status", "Details"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 bg-slate-50/60 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[120px]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">

                      {/* Row number — ref number intentionally hidden for security */}
                      <td className="px-4 py-3 text-slate-400 font-medium text-center w-10">
                        {index + 1}
                      </td>

                      {/* Date of Request */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                          : "—"}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 whitespace-nowrap">
                          {item.name || "—"}
                        </span>
                      </td>

                      {/* Date of Travel */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.date_of_travel || "—"}
                      </td>

                      {/* Destination */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.destination || "—"}
                      </td>

                      {/* Purpose */}
                      <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                        {item.purpose || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* View button — triggers ref verify prompt */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewClick(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-slate-600 transition whitespace-nowrap"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Showing {filteredData.length} of {data.length} requests
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}