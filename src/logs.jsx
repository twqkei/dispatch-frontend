import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "./api";

function fmtTravelDate(dateOfTravel, expectedReturn) {
  if (!dateOfTravel) return "—";
  const start = new Date(dateOfTravel + "T00:00:00");
  const opts = { month: "short", day: "numeric" };

  if (!expectedReturn) {
    return start.toLocaleDateString([], { ...opts, year: "numeric" });
  }

  const end = new Date(expectedReturn + "T00:00:00");

  // Same day — just show single date
  if (dateOfTravel === expectedReturn) {
    return start.toLocaleDateString([], { ...opts, year: "numeric" });
  }

  // Same month — "May 19–20, 2026"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString([], opts)} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  // Different months — "May 30 – Jun 2, 2026"
  return `${start.toLocaleDateString([], opts)} – ${end.toLocaleDateString([], { ...opts, year: "numeric" })}`;
}

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const Icon = {
  Search: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  Filter: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 4h18M7 12h10M10 20h4"/>
    </svg>
  ),
  Print: () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8" rx="1"/>
    </svg>
  ),
  Close: () => (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
    </svg>
  ),
};

function StatusBadge({ status }) {
  const map = {
    UPCOMING:  { label: "Upcoming",  className: "bg-blue-50 text-blue-600 border border-blue-200" },
    ONGOING:   { label: "Ongoing",   className: "bg-amber-50 text-amber-600 border border-amber-200" },
    COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
    CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-500 border border-rose-200" },
  };
  const s = map[status] ?? { label: status || "—", className: "bg-slate-100 text-slate-400" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

function WeekPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none h-8 pl-3 pr-7 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 font-medium cursor-pointer"
        >
          <option value="">All</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon.ChevronDown />
        </span>
      </div>
    </div>
  );
}

export default function Logs() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [allTrips, setAllTrips]           = useState([]);
  const [selectedWeek, setSelectedWeek]   = useState(null);
  const [showSearch, setShowSearch]       = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  const [filter, setFilterState]          = useState({ search: "", driver: "", vehicle: "", department: "" });
  const searchRef = useRef(null);

  useEffect(() => {
    apiFetch("/trips/")
      .then((d) => setAllTrips(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => setAllTrips([]));
  }, []);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showSearch]);

  const setF = (k, v) => setFilterState((p) => ({ ...p, [k]: v }));

  const matches = (t, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return ["destination", "driver_name", "vehicle_name", "requester", "department", "remarks"]
      .some((k) => (t[k] || "").toLowerCase().includes(s));
  };

  const monthTrips = useMemo(() => allTrips.filter((t) => {
    if (!t.date_of_trip) return false;
    const d = new Date(t.date_of_trip);
    return (
      d.getMonth() === selectedMonth &&
      matches(t, filter.search) &&
      (!filter.driver     || (t.driver_name  || "").toLowerCase() === filter.driver.toLowerCase()) &&
      (!filter.vehicle    || (t.vehicle_name || "").toLowerCase() === filter.vehicle.toLowerCase()) &&
      (!filter.department || (t.department   || "").toLowerCase() === filter.department.toLowerCase())
    );
  }).sort((a, b) => new Date(b.date_of_trip) - new Date(a.date_of_trip)), [allTrips, selectedMonth, filter]);

  const grouped = useMemo(() => {
    const g = {};
    monthTrips.forEach((t) => {
      const w = Math.ceil(new Date(t.date_of_trip).getDate() / 7);
      (g[w] = g[w] || []).push(t);
    });
    return g;
  }, [monthTrips]);

  const weekKeys  = useMemo(() => Object.keys(grouped).map(Number).sort((a, b) => a - b), [grouped]);
  const tableRows = useMemo(() => selectedWeek == null ? monthTrips : (grouped[selectedWeek] || []), [selectedWeek, monthTrips, grouped]);

  const drivers     = useMemo(() => [...new Set(monthTrips.map((t) => t.driver_name).filter(Boolean))].sort(),  [monthTrips]);
  const vehicles    = useMemo(() => [...new Set(monthTrips.map((t) => t.vehicle_name).filter(Boolean))].sort(), [monthTrips]);
  const departments = useMemo(() => [...new Set(monthTrips.map((t) => t.department).filter(Boolean))].sort(),   [monthTrips]);

  const activeFilterCount = [filter.driver, filter.vehicle, filter.department].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f7f7f8] font-sans">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] no-print">
        <div className="px-6 h-14 flex items-center gap-4">

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Trip Logs</h1>
          </div>

          {/* Month pills */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
            {months.map((m, i) => (
              <button
                key={i}
                onClick={() => { setSelectedMonth(i); setSelectedWeek(null); }}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
                  selectedMonth === i
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setShowSearch((v) => !v)}
              title="Search"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                showSearch ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon.Search />
            </button>

            <button
              onClick={() => setShowFilters((v) => !v)}
              title="Filters"
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                showFilters || activeFilterCount > 0 ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon.Filter />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => window.print()}
              title="Print"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Icon.Print />
            </button>

            <div className="ml-1 px-3 h-8 flex items-center bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
              {tableRows.length} <span className="font-normal text-slate-400 ml-1">trips</span>
            </div>
          </div>
        </div>

        {/* Search slide-down */}
        <div className={`overflow-hidden transition-all duration-200 ${showSearch ? "max-h-14" : "max-h-0"}`}>
          <div className="px-6 pb-3 pt-0 flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Icon.Search />
              </span>
              <input
                ref={searchRef}
                value={filter.search}
                onChange={(e) => setF("search", e.target.value)}
                placeholder="Search requester, destination, remarks, driver…"
                className="w-full h-8 pl-9 pr-8 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 placeholder-slate-400"
              />
              {filter.search && (
                <button onClick={() => setF("search", "")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <Icon.Close />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter slide-down */}
        <div className={`overflow-hidden transition-all duration-200 ${showFilters ? "max-h-24" : "max-h-0"}`}>
          <div className="px-6 pb-3 flex flex-wrap items-end gap-4 border-t border-slate-100 pt-3">
            <FilterSelect label="Vehicle"    value={filter.vehicle}    onChange={(v) => setF("vehicle", v)}    options={vehicles} />
            <FilterSelect label="Driver"     value={filter.driver}     onChange={(v) => setF("driver", v)}     options={drivers} />
            <FilterSelect label="Department" value={filter.department} onChange={(v) => setF("department", v)} options={departments} />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilterState((p) => ({ ...p, driver: "", vehicle: "", department: "" }))}
                className="h-8 px-3 text-[11px] font-semibold text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors self-end"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Week pills + mobile months ── */}
      <div className="px-6 pt-4 pb-0 no-print">
        <div className="flex md:hidden gap-1 overflow-x-auto no-scrollbar mb-3 pb-1">
          {months.map((m, i) => (
            <button
              key={i}
              onClick={() => { setSelectedMonth(i); setSelectedWeek(null); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedMonth === i ? "bg-slate-900 text-white" : "text-slate-500 bg-white border border-slate-200"
              }`}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <WeekPill label="All" active={selectedWeek == null} onClick={() => setSelectedWeek(null)} />
          {weekKeys.map((w) => (
            <WeekPill key={w} label={`Wk ${w}`} active={selectedWeek === w} onClick={() => setSelectedWeek(w)} />
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="px-6 pt-3 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col style={{ width: "2.2rem" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "7rem" }} />
              <col style={{ width: "7rem" }} />
              <col style={{ width: "7rem" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["#", "Name", "Department", "Vehicle", "Driver", "Destination", "Purpose", "DateRequest", "DateTravel", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="block truncate">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedWeek == null
                ? weekKeys.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">No trips this month</td>
                    </tr>
                  )
                  : weekKeys.map((w) => (
                      <>
                        <tr key={`wk-${w}`} className="bg-slate-50/80">
                          <td colSpan={10} className="px-3 py-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Week {w}</span>
                            <span className="ml-2 text-[10px] text-slate-300">{grouped[w].length} trips</span>
                          </td>
                        </tr>
                        {grouped[w].map((trip, i) => <TripRow key={trip.id} trip={trip} i={i} />)}
                      </>
                    ))
                : tableRows.length === 0
                  ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-slate-400">No trips in this week</td>
                    </tr>
                  )
                  : tableRows.map((trip, i) => <TripRow key={trip.id} trip={trip} i={i} />)
              }
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {selectedWeek == null ? "Monthly" : `Week ${selectedWeek}`} total:{" "}
              <strong className="text-slate-700">{tableRows.length}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              {months[selectedMonth]} {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media print {
          .no-print { display: none !important; }
          nav, header { display: none !important; }
          body { background: white !important; margin: 0; }
          .px-6 { padding-left: 0 !important; padding-right: 0 !important; }
          .pt-3, .pt-4, .pb-8 { padding: 0 !important; }
          .min-h-screen { min-height: unset !important; }
          .rounded-xl { border-radius: 0 !important; }
          .shadow-\\[0_1px_4px_rgba\\(0\\,0\\,0\\,0\\.04\\)\\] { box-shadow: none !important; }
          .border { border-color: #cbd5e1 !important; }
          table { font-size: 9px !important; width: 100% !important; }
          th, td { padding: 4px 6px !important; }
          .bg-slate-50\\/60 { background: white !important; }
          @page { margin: 10mm; size: landscape; }
        }
      `}</style>
    </div>
  );
}

function TripRow({ trip, i }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="px-3 py-2.5 text-slate-400 font-mono text-[10px]">{i + 1}</td>
      <td className="px-3 py-2.5 overflow-hidden">
        <div className="font-semibold text-slate-800 text-[11px] truncate" title={trip.requester}>
          {trip.requester || "—"}
        </div>
      </td>
      <td className="px-3 py-2.5 text-slate-500 overflow-hidden">
        <span className="block truncate" title={trip.department}>{trip.department || "—"}</span>
      </td>
      <td className="px-3 py-2.5 font-medium text-slate-700 overflow-hidden">
        <span className="block truncate" title={trip.vehicle_name}>
          {trip.vehicle_name || <span className="text-slate-300">—</span>}
        </span>
      </td>
      <td className="px-3 py-2.5 text-slate-600 overflow-hidden">
        <span className="block truncate" title={trip.driver_name}>
          {trip.driver_name || <span className="text-slate-300">—</span>}
        </span>
      </td>
      <td className="px-3 py-2.5 text-slate-600 overflow-hidden">
        <span className="block truncate" title={trip.destination}>{trip.destination || "—"}</span>
      </td>
      <td className="px-3 py-2.5 text-slate-500 overflow-hidden">
        <span className="block truncate" title={trip.remarks}>
          {trip.remarks || <span className="text-slate-300">—</span>}
        </span>
      </td>
      <td className="px-3 py-2.5 text-slate-500 tabular-nums">{fmtTravelDate(trip.date_requested)}</td>

      <td className="px-3 py-2.5 text-slate-500 tabular-nums whitespace-nowrap">
        {fmtTravelDate(trip.date_of_trip, trip.date_of_returned)}
      </td>
      <td className="px-3 py-2.5">
        <StatusBadge status={trip.status} />
      </td>
    </tr>
  );
}