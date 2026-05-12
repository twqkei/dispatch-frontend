import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_COLORS = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ONGOING:   "bg-blue-100 text-blue-700",
  UPCOMING:  "bg-amber-100 text-amber-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${cls}`}>
      {status || "—"}
    </span>
  );
}

function Logs() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [allTrips, setAllTrips]           = useState([]);
  const [monthFilter, setMonthFilter]     = useState({ search: "", driver: "", vehicle: "", status: "" });
  const [selectedWeek, setSelectedWeek]   = useState(null);

  useEffect(() => {
    apiFetch("/trips/")
      .then((data) => setAllTrips(data))
      .catch((err) => { console.error(err); setAllTrips([]); });
  }, []);

  const matchesSearch = (t, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (t.destination  || "").toLowerCase().includes(s) ||
      (t.driver_name  || "").toLowerCase().includes(s) ||
      (t.vehicle_name || "").toLowerCase().includes(s) ||
      (t.requester    || "").toLowerCase().includes(s) ||
      (t.remarks      || "").toLowerCase().includes(s)
    );
  };

  const monthTrips = useMemo(() => {
    return allTrips
      .filter((t) => {
        if (!t.date_of_trip) return false;
        const d = new Date(t.date_of_trip);
        return (
          d.getMonth() === selectedMonth &&
          matchesSearch(t, monthFilter.search) &&
          (!monthFilter.driver  || (t.driver_name  || "").toLowerCase() === monthFilter.driver.toLowerCase()) &&
          (!monthFilter.vehicle || (t.vehicle_name || "").toLowerCase() === monthFilter.vehicle.toLowerCase()) &&
          (!monthFilter.status  || (t.status       || "").toLowerCase() === monthFilter.status.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.date_of_trip) - new Date(a.date_of_trip));
  }, [allTrips, selectedMonth, monthFilter]);

  const grouped = useMemo(() => {
    const g = {};
    monthTrips.forEach((t) => {
      const week = Math.ceil(new Date(t.date_of_trip).getDate() / 7);
      if (!g[week]) g[week] = [];
      g[week].push(t);
    });
    return g;
  }, [monthTrips]);

  const weekKeys = useMemo(() => Object.keys(grouped).map(Number).sort((a, b) => b - a), [grouped]);

  const tableTrips = useMemo(() => {
    if (selectedWeek == null) return monthTrips;
    return grouped[selectedWeek] || [];
  }, [selectedWeek, monthTrips, grouped]);

  const monthDrivers  = useMemo(() => [...new Set(monthTrips.map((t) => t.driver_name).filter(Boolean))].sort(), [monthTrips]);
  const monthVehicles = useMemo(() => [...new Set(monthTrips.map((t) => t.vehicle_name).filter(Boolean))].sort(), [monthTrips]);
  const monthStatuses = useMemo(() => [...new Set(monthTrips.map((t) => t.status).filter(Boolean))].sort(), [monthTrips]);

  const setFilter = (key, val) => setMonthFilter((p) => ({ ...p, [key]: val }));

  /* shared select / input classes */
  const selectCls = "h-9 px-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-medium";

  /* ── Table component (reused for both all-weeks and single-week) ── */
  const TripTable = ({ rows, showWeekHeader, week }) => (
    <div className={showWeekHeader ? "mb-6 print-week-section" : ""}>
      {showWeekHeader && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Week {week}</span>
          <span className="ml-2 text-[10px] text-slate-300">({rows.length} trips)</span>
        </div>
      )}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {["#","Vehicle","Driver","Destination","Time","Pax","Requester","Remarks","Status","Date"].map((h) => (
              <th key={h} className="sticky top-0 z-10 bg-slate-50 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td colSpan={10} className="py-12 text-center text-slate-400 text-sm">No trips</td></tr>
          ) : (
            rows.map((trip, i) => (
              <tr key={trip.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">{trip.vehicle_name || "—"}</td>
                <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">{trip.driver_name || "—"}</td>
                <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate">{trip.destination || "—"}</td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{trip.time_of_travel || "—"}</td>
                <td className="px-3 py-2.5 text-slate-500 text-center">{trip.passengers ?? "—"}</td>
                <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{trip.requester || "—"}</td>
                <td className="px-3 py-2.5 text-slate-500 max-w-[140px] truncate">{trip.remarks || <span className="text-slate-300">—</span>}</td>
                <td className="px-3 py-2.5"><StatusBadge status={trip.status} /></td>
                <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{trip.date_of_trip || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <td colSpan={10} className="px-3 py-2 text-xs text-slate-500 font-semibold border-t border-slate-200">
              Total trips: <span className="text-slate-800">{rows.length}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      {/* Month Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 no-print">
        {months.map((m, i) => (
          <button
            key={i}
            onClick={() => { setSelectedMonth(i); setSelectedWeek(null); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              selectedMonth === i
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          {months[selectedMonth]}{" "}
          <span className="text-slate-400 font-medium text-base">
            — {selectedWeek ? `Week ${selectedWeek}` : "All Logs"}
          </span>
        </h1>
      </div>

      {/* Week folder tabs */}
      <div className="flex gap-2 items-end mb-0 no-print px-1">
        {[null, ...weekKeys].map((week, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedWeek(week)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border border-b-0 transition-all ${
              selectedWeek === week
                ? "bg-emerald-500 text-white border-emerald-400 shadow-md translate-y-0 z-10"
                : "bg-slate-100 text-slate-500 border-slate-200 translate-y-1 opacity-75 hover:opacity-100"
            }`}
          >
            {week == null ? "All" : `Week ${week}`}
          </button>
        ))}
      </div>

      {/* Toolbar card */}
      <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-slate-200 shadow-sm px-4 py-3 mb-4 no-print">
        <div className="flex flex-wrap items-end gap-3 justify-between">
          <div className="flex flex-wrap gap-3 items-end">

            {/* Vehicle */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</label>
              <select className={selectCls} value={monthFilter.vehicle} onChange={(e) => setFilter("vehicle", e.target.value)}>
                <option value="">All</option>
                {monthVehicles.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Driver */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver</label>
              <select className={selectCls} value={monthFilter.driver} onChange={(e) => setFilter("driver", e.target.value)}>
                <option value="">All</option>
                {monthDrivers.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select className={selectCls} value={monthFilter.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">All</option>
                {monthStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search</label>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  className="h-9 pl-8 pr-3 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-slate-400 w-64"
                  placeholder="Destination, requester, remarks…"
                  value={monthFilter.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
              Total: <span className="text-slate-800 font-bold">{tableTrips.length}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              🖨 Print
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          {selectedWeek == null ? (
            <>
              {weekKeys.map((week) => (
                <TripTable key={week} rows={grouped[week] || []} showWeekHeader week={week} />
              ))}
              {weekKeys.length === 0 && (
                <div className="py-16 text-center text-slate-400 text-sm">No trips this month</div>
              )}
            </>
          ) : (
            <TripTable rows={tableTrips} showWeekHeader={false} />
          )}
        </div>

        {/* Monthly total footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Overall monthly total:{" "}
            <span className="font-bold text-slate-700">{monthTrips.length}</span>
          </span>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

export default Logs;