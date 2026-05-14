import { useEffect, useState } from "react";
import SendRequestModal from "./Sendrequestmodal";
import ViewRequestModal from "./Viewrequestmodal";


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

// ─── Status Badge (read-only display) ────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};


// ─── Main page ────────────────────────────────────────────────────────────────
const ALL_STATUSES = ["All", "Pending", "Approved", "Disapproved"];

export default function RequestStatus() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch("https://sheetdb.io/api/v1/cyqjdv9avucvn")
      .then((res) => res.json())
      .then((d) => {
        const sorted = [...d].sort((a, b) => new Date(b["Timestamp"]) - new Date(a["Timestamp"]));
        // Attach local admin fields so dropdowns work without re-fetching
        setData(sorted.map((row, i) => ({
          ...row,
          _id: i,
          _driver:  row["Assigned Driver"]  || row["Driver"]  || "",
          _vehicle: row["Assigned Vehicle"] || row["Vehicle"] || "",
          _status:  row["STATUS"] || "Pending",
        })));
        setLoading(false);
        setLastUpdated(new Date());
      });
  };

  useEffect(() => { fetchData(); }, []);

  // ── Update a row field locally + patch SheetDB ────────────────────────────
  const updateField = async (rowIndex, field, value) => {
    setData((prev) =>
      prev.map((r, i) => i === rowIndex ? { ...r, [field]: value } : r)
    );

    // Map local field → SheetDB column name
    const colMap = { _driver: "Assigned Driver", _vehicle: "Assigned Vehicle", _status: "STATUS" };
    const col = colMap[field];
    if (!col) return;

    const row = data[rowIndex];
    const ts  = encodeURIComponent(row["Timestamp"] || "");
    try {
      await fetch(`https://sheetdb.io/api/v1/cyqjdv9avucvn/Timestamp/${ts}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { [col]: value } }),
      });
    } catch {
      console.warn("SheetDB patch failed — change saved locally only.");
    }
  };

  const filteredData = data.filter((item) => {
    const name   = (item["Name:"] || "").toLowerCase();
    const dest   = (item["Travel Destination"] || "").toLowerCase();
    const status = item._status || "";
    const matchesSearch = name.includes(search.toLowerCase()) || dest.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = data.filter((d) => d._status === s).length;
    return acc;
  }, {});

  // Build a clean request object for the ViewRequestModal
  const buildRequest = (item) => ({
    referenceNo:   `VR-${String(item._id + 1).padStart(4, "0")}`,
    status:        item._status,
    timestamp:     item["Timestamp"],
    email:         item["Email Address"],
    name:          item["Name:"] || item["Name"],
    department:    item["Department / Office"],
    immediateHead: item["Immediate Head"],
    mobile:        item["Mobile Number"] || item["Contact Number"],
    dateOfTravel:  item["Date of Travel"],
    destination:   item["Travel Destination"],
    purpose:       item["Purpose of Travel"],
    waitingArea:   item["Waiting Area"],
    departureTime: item["Time of Departure"],
    expectedReturn:item["Expected Return"],
    numPassengers: item["Number of Passengers"],
    passengerNames:item["Name of Passengers"],
    projectBased:  item["Project Based Travel"],
    fundingType:   item["if yes, is it"],
    driver:        item._driver,
    vehicle:       item._vehicle,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      {/* Send Request modal */}
      {showForm && (
        <SendRequestModal
          onClose={() => setShowForm(false)}
          onSubmitted={() => { setTimeout(fetchData, 1500); }}
        />
      )}

      {/* View Receipt modal */}
      {viewingRequest && (
        <ViewRequestModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Travel Requests</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {lastUpdated
                ? `Last synced ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Loading…"}
            </p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-3 mt-4">
          {ALL_STATUSES.slice(1).map((s) => {
            const cfg = getStatusConfig(s);
            return (
              <div
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border cursor-pointer transition shadow-sm hover:shadow-md ${statusFilter === s ? "border-slate-400 shadow-md" : "border-slate-200"}`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-sm font-medium text-slate-700">{s}</span>
                <span className="text-xs font-bold text-slate-400">{counts[s] ?? 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
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
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-emerald-900 rounded-xl text-sm font-semibold transition shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Send Request
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {["#", "Date of Request", "Name", "Date of Travel", "Destination", "Purpose","Status", "Details"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 bg-slate-50/60 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  // Find the true index in data[] so updateField targets the right row
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">

                      {/* # */}
                      <td className="px-4 py-3 text-slate-400 font-mono">
                        #{String(index + 1).padStart(3, "0")}
                      </td>

                      {/* Date of Request */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {item["Timestamp"] || "—"}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div name={item["Name:"]} />
                          <span className="font-medium text-slate-700 whitespace-nowrap">
                            {item["Name:"] || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Date of Travel */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item["Date of Travel"] || "—"}
                      </td>

                      {/* Destination */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item["Travel Destination"] || "—"}
                      </td>

                      {/* Purpose */}
                      <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                        {item["Purpose of Travel"] || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={item._status} />
                      </td>

                      {/* Receipt / View button — replaces Remarks */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewingRequest(buildRequest(item))}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {filteredData.length} of {data.length} requests
            </span>
          </div>
        )}
      </div>
    </div>
  );
}