import { useEffect, useState } from "react";

const getStatusConfig = (status) => {
  switch (status) {
    case "Approved":
      return {
        dot: "bg-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        label: "Approved",
      };
    case "Pending":
      return {
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        label: "Pending",
      };
    case "Disapproved":
      return {
        dot: "bg-red-400",
        badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
        label: "Disapproved",
      };
    default:
      return {
        dot: "bg-gray-300",
        badge: "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
        label: status || "—",
      };
  }
};

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "bg-rose-100 text-rose-600",
    "bg-violet-100 text-violet-600",
    "bg-sky-100 text-sky-600",
    "bg-teal-100 text-teal-600",
    "bg-orange-100 text-orange-600",
  ];
  const color = colors[(name || "").charCodeAt(0) % colors.length];
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const STATUSES = ["All", "Pending", "Approved", "Disapproved"];

export default function RequestStatus() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = () => {
    fetch("https://sheetdb.io/api/v1/cyqjdv9avucvn")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        setLastUpdated(new Date());
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter((item) => {
    const name = (item["Name:"] || "").toLowerCase();
    const dest = (item["Travel Destination"] || "").toLowerCase();
    const status = item["STATUS"] || "";
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      dest.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = data.filter((d) => d["STATUS"] === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Travel Requests
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {lastUpdated
                ? `Last synced ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Loading…"}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Summary Pills */}
        <div className="flex gap-3 mt-4">
          {STATUSES.slice(1).map((s) => {
            const cfg = getStatusConfig(s);
            return (
              <div
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border cursor-pointer transition shadow-sm hover:shadow-md ${
                  statusFilter === s
                    ? "border-slate-400 shadow-md"
                    : "border-slate-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-sm font-medium text-slate-700">{s}</span>
                <span className="text-xs font-bold text-slate-400">
                  {counts[s] ?? 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
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
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Status" : s}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-slate-400 font-medium">
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3 bg-slate-50/60">#</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Name</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Destination</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Status</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Driver</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Vehicle</th>
                <th className="text-left px-5 py-3 bg-slate-50/60">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[120px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-400 text-sm">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">
                      #{String(index + 1).padStart(3, "0")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={item["Name:"]} />
                        <span className="font-medium text-slate-700 whitespace-nowrap">
                          {item["Name:"] || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      {item["Travel Destination"] || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item["STATUS"]} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item["Assigned Driver"] || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {item["Assigned Vehicle"] || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-[200px] truncate">
                      {item["Remarks"] || (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
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
            <span className="text-xs text-slate-300">Auto-refreshes every 15s</span>
          </div>
        )}
      </div>
    </div>
  );
}