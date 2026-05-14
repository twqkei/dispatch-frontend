import { useEffect, useState, useRef } from "react";
import ViewRequestModal from "./Viewrequestmodal";
import { apiFetch } from "./api";

// ─── Status config — GREEN theme ─────────────────────────────────────────────
const STATUS_CFG = {
  APPROVED:    { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Approved" },
  PENDING:     { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border border-amber-200",       label: "Pending" },
  DISAPPROVED: { dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border border-red-200",             label: "Disapproved" },
};
const getStatusCfg = (s) =>
  STATUS_CFG[(s || "").toUpperCase()] || {
    dot: "bg-slate-300",
    badge: "bg-slate-50 text-slate-500 border border-slate-200",
    label: s || "—",
  };

// ─── Avatar color pool ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-teal-500",
];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Status Dropdown ──────────────────────────────────────────────────────────
const StatusDropdown = ({ value, onChange, saving }) => {
  const cfg = getStatusCfg(value);
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value || "PENDING"}
        onChange={(e) => onChange(e.target.value)}
        disabled={saving}
        className={`appearance-none pl-6 pr-5 py-1 rounded-full text-[11px] font-semibold cursor-pointer focus:outline-none transition disabled:opacity-50 ${cfg.badge}`}
      >
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="DISAPPROVED">Disapproved</option>
      </select>
      <span className={`pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <svg className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {saving && (
        <svg className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
    </div>
  );
};

// ─── Assign Dropdown ──────────────────────────────────────────────────────────
const AssignDropdown = ({ value, options, placeholder, onChange, saving }) => (
  <div className="relative">
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      disabled={saving}
      className="appearance-none w-full pl-2.5 pr-6 py-1 rounded-lg text-[11px] font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 cursor-pointer disabled:opacity-50 min-w-[110px]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
    <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return <svg className="w-3 h-3 opacity-20 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>;
  return sortDir === "asc"
    ? <svg className="w-3 h-3 ml-1 inline text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
    : <svg className="w-3 h-3 ml-1 inline text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
};

// ─── Inline action buttons (like reference screenshot) ───────────────────────
const ActionButtons = ({ onView, onEdit, onDelete }) => (
  <div className="flex items-center gap-1.5">
    <button onClick={onView} title="View"
      className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
    <button onClick={onEdit} title="Edit / Admin Remarks"
      className="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 transition">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </button>
    <button onClick={onDelete} title="Delete"
      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
);

// ─── Sortable columns ─────────────────────────────────────────────────────────
const SORTABLE_COLS = [
  { key: "name",           label: "Name" },
  { key: "date_of_travel", label: "Travel Date" },
  { key: "destination",    label: "Destination" },
  { key: "department",     label: "Department" },
  { key: "status",         label: "Status" },
];

const ALL_STATUSES = ["All", "PENDING", "APPROVED", "DISAPPROVED"];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRequestStatus() {
  const [data, setData]                 = useState([]);
  const [drivers, setDrivers]           = useState([]);
  const [vehicles, setVehicles]         = useState([]);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading]           = useState(true);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [modalState, setModalState]     = useState(null);
  const [saving, setSaving]             = useState({});
  const [selected, setSelected]         = useState(new Set());
  const [sortCol, setSortCol]           = useState("date_of_travel");
  const [sortDir, setSortDir]           = useState("desc");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [requests, driverList, vehicleList] = await Promise.all([
        apiFetch("/requests/"),
        apiFetch("/drivers/"),
        apiFetch("/vehicles/"),
      ]);
      setData(requests);
      setDrivers(driverList.map((d) => ({ id: d.id, label: d.name })));
      setVehicles(vehicleList.map((v) => ({ id: v.id, label: `${v.plate_number} — ${v.model}` })));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const patchRequest = async (id, field, value) => {
    const key = `${id}_${field}`;
    setSaving((s) => ({ ...s, [key]: true }));
    setData((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    setModalState((prev) => {
      if (!prev || prev.request?.id !== id) return prev;
      return { ...prev, request: { ...prev.request, [field]: value } };
    });
    try {
      await apiFetch(`/requests/${id}/`, { method: "PATCH", body: JSON.stringify({ [field]: value }) });
    } catch (err) {
      console.error("Patch failed:", err);
      fetchAll();
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

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

  const handleSort = (col) => {
    setSortDir((d) => sortCol === col ? (d === "asc" ? "desc" : "asc") : "asc");
    setSortCol(col);
  };

  const processedData = [...data]
    .filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (item.name || "").toLowerCase().includes(q) ||
        (item.destination || "").toLowerCase().includes(q) ||
        (item.department || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let av = a[sortCol] ?? "";
      let bv = b[sortCol] ?? "";
      if (sortCol === "date_of_travel" || sortCol === "created_at") {
        av = new Date(av); bv = new Date(bv);
      } else {
        av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      }
      return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
    });

  const counts = ALL_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = data.filter((d) => d.status === s).length;
    return acc;
  }, {});

  const openModal  = (item, mode = "view") => setModalState({ request: buildRequest(item), mode });
  const allSelected = processedData.length > 0 && processedData.every((r) => selected.has(r.id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(processedData.map((r) => r.id)));
  const toggleOne   = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleAdminSave = async (updatedRequest) => {
    const id = updatedRequest.id;
    if (!id) return;
    try {
      await apiFetch(`/requests/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ admin_remarks: updatedRequest.adminRemarks, status: updatedRequest.status }),
      });
      setData((prev) => prev.map((r) => r.id === id
        ? { ...r, admin_remarks: updatedRequest.adminRemarks, status: updatedRequest.status }
        : r
      ));
    } catch (err) { console.error("Admin save failed", err); }
    setModalState(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>

      {modalState && (
        <ViewRequestModal
          request={modalState.request}
          initialMode={modalState.mode}
          isAdmin
          onClose={() => setModalState(null)}
          onAdminSave={handleAdminSave}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Travel Requests</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {lastUpdated ? `Synced ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Loading…"}
          </p>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.slice(1).map((s) => {
            const cfg    = getStatusCfg(s);
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(active ? "All" : s)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border text-xs font-medium transition shadow-sm ${
                  active ? "border-emerald-400 ring-1 ring-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className={`font-bold ml-0.5 ${active ? "text-emerald-600" : "text-slate-400"}`}>{counts[s] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder-slate-400 text-slate-700 w-52" />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-700">
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Status" : getStatusCfg(s).label}</option>)}
          </select>

          {/* Sort control */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Sort:</span>
            <select value={sortCol} onChange={(e) => setSortCol(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-700">
              {SORTABLE_COLS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <button onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition">
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {selected.size > 0 && (
              <span className="text-xs text-slate-500 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                {selected.size} selected
              </span>
            )}
            <span className="text-xs text-slate-400">{processedData.length} / {data.length}</span>
            <button onClick={fetchAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Table — table-fixed, no overflow-x, columns proportional ── */}
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col style={{ width: "32px" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "9%" }} />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-3 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-500 cursor-pointer" />
              </th>
              {[
                { label: "Name",        col: "name" },
                { label: "Order No",    col: null },
                { label: "Department",  col: "department" },
                { label: "Travel Date", col: "date_of_travel" },
                { label: "Destination", col: "destination" },
                { label: "Status",      col: "status" },
                { label: "Driver",      col: null },
                { label: "Vehicle",     col: null },
                { label: "Action",      col: null },
              ].map(({ label, col }) => (
                <th key={label}
                  onClick={() => col && handleSort(col)}
                  className={`px-3 py-3 text-left select-none whitespace-nowrap ${col ? "cursor-pointer hover:text-emerald-600" : ""}`}>
                  {label}
                  {col && <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-3 py-4"><div className="h-3 bg-slate-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              : processedData.length === 0
              ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      No requests found
                    </div>
                  </td>
                </tr>
              )
              : processedData.map((item) => {
                  const isRejected = (item.status || "").toUpperCase() === "DISAPPROVED";
                  const isSelected = selected.has(item.id);
                  return (
                    <tr key={item.id}
                      className={`transition-colors ${
                        isRejected ? "bg-red-50/50 hover:bg-red-50" :
                        isSelected ? "bg-emerald-50/40" :
                        "hover:bg-slate-50/80"
                      } ${isRejected ? "border-l-2 border-l-red-300" : ""}`}>

                      {/* Checkbox */}
                      <td className="px-3 py-3.5">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(item.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-500 cursor-pointer" />
                      </td>

                      {/* Name + subtitle (department) */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(item.name)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                            {(item.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 truncate text-[12px] leading-tight">{item.name || "—"}</p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{item.department || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Ref # */}
                      <td className="px-3 py-3.5">
                        <span className="font-mono text-emerald-600 font-semibold text-[11px]">
                          #{String(item.id).padStart(4, "0")}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-3 py-3.5 text-slate-500 text-[11px] truncate">
                        {item.department || "—"}
                      </td>

                      {/* Travel Date */}
                      <td className="px-3 py-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                        {item.date_of_travel
                          ? new Date(item.date_of_travel + "T00:00:00").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>

                      {/* Destination */}
                      <td className="px-3 py-3.5 text-slate-600 text-[11px] truncate">
                        {item.destination || "—"}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5">
                        <StatusDropdown
                          value={item.status}
                          saving={saving[`${item.id}_status`]}
                          onChange={(val) => patchRequest(item.id, "status", val)}
                        />
                      </td>

                      {/* Driver */}
                      <td className="px-3 py-3.5">
                        <AssignDropdown
                          value={item.driver}
                          options={drivers}
                          placeholder="— Driver —"
                          saving={saving[`${item.id}_driver`]}
                          onChange={(val) => patchRequest(item.id, "driver", val)}
                        />
                      </td>

                      {/* Vehicle */}
                      <td className="px-3 py-3.5">
                        <AssignDropdown
                          value={item.vehicle}
                          options={vehicles}
                          placeholder="— Vehicle —"
                          saving={saving[`${item.id}_vehicle`]}
                          onChange={(val) => patchRequest(item.id, "vehicle", val)}
                        />
                      </td>

                      {/* Actions — inline icon buttons */}
                      <td className="px-3 py-3.5">
                        <ActionButtons
                          onView={() => openModal(item, "view")}
                          onEdit={() => openModal(item, "adminEdit")}
                          onDelete={() => {
                            if (window.confirm(`Delete request #${String(item.id).padStart(4, "0")}?`)) {
                              apiFetch(`/requests/${item.id}/`, { method: "DELETE" })
                                .then(() => setData((prev) => prev.filter((r) => r.id !== item.id)))
                                .catch(console.error);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>

        {/* Footer */}
        {!loading && data.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Showing {processedData.length} of {data.length}</span>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {ALL_STATUSES.slice(1).map((s) => {
                const cfg = getStatusCfg(s);
                return (
                  <span key={s} className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}: <strong className="text-slate-600 ml-0.5">{counts[s]}</strong>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}