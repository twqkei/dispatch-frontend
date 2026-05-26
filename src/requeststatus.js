import { useEffect, useState } from "react";
import ViewRequestModal from "./requester/Viewrequestmodal";
import { apiFetch } from "./api";
import { generateTripTicket } from "./generateTripTicket";

const TEMPLATE_URL = "/templates/tripticket.xlsx";

function fmtTravelDate(dateOfTravel, dateofReturned) {
  if (!dateOfTravel) return "—";
  const start = new Date(dateOfTravel + "T00:00:00");
  const opts = { month: "short", day: "numeric" };

  if (!dateofReturned) {
    return start.toLocaleDateString([], { ...opts, year: "numeric" });
  }

  const end = new Date(dateofReturned + "T00:00:00");

  if (dateOfTravel === dateofReturned) {
    return start.toLocaleDateString([], { ...opts, year: "numeric" });
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString([], opts)} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${start.toLocaleDateString([], opts)} – ${end.toLocaleDateString([], { ...opts, year: "numeric" })}`;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  APPROVED:    { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Approved" },
  PENDING:     { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border border-amber-200",       label: "Pending" },
  DISAPPROVED: { dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border border-red-200",             label: "Disapproved" },
  CANCELLED:   { dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-500 border border-slate-200",       label: "Cancelled" },
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ count, onConfirm, onCancel, loading }) => {
  const label = count === 1 ? "this request" : `${count} requests`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-[15px] font-bold text-slate-800">
              Delete {count === 1 ? "Request" : "Requests"}?
            </h2>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-500 leading-relaxed mb-1">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-slate-700">{label}</span>?
          </p>
          <p className="text-xs text-slate-400">
            This action cannot be undone and will remove the data from the database.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-red-200"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete {count > 1 ? `${count} Records` : "Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status Dropdown ──────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: "PENDING",     label: "Pending",     dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",      optBg: "bg-amber-50",   optText: "text-amber-700",   optHover: "hover:bg-amber-100" },
  { value: "APPROVED",    label: "Approved",    dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", optBg: "bg-emerald-50", optText: "text-emerald-700", optHover: "hover:bg-emerald-100" },
  { value: "DISAPPROVED", label: "Disapproved", dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",            optBg: "bg-red-50",     optText: "text-red-700",     optHover: "hover:bg-red-100" },
  { value: "CANCELLED",   label: "Cancelled",   dot: "bg-slate-400",   badge: "bg-slate-50 text-slate-600 border-slate-200",      optBg: "bg-slate-50",   optText: "text-slate-600",   optHover: "hover:bg-slate-100" },
];

const StatusDropdown = ({ value, onChange, saving, disabled }) => {
  const [open, setOpen] = useState(false);
  const current = STATUS_OPTS.find((o) => o.value === (value || "PENDING")) || STATUS_OPTS[0];
  const isCancelled = (value || "").toUpperCase() === "CANCELLED";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={saving || disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-[11px] font-semibold border focus:outline-none transition
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${current.badge}`}
      >
        {isCancelled ? (
          <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
        )}
        {current.label}
        {!disabled && (
          <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {saving && (
        <svg className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}

      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 left-0 w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {STATUS_OPTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold transition
                  ${opt.optHover}
                  ${value === opt.value ? `${opt.optBg} ${opt.optText}` : "text-slate-600"}`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
                {value === opt.value && (
                  <svg className={`w-3 h-3 ml-auto ${opt.optText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Assign Dropdown ──────────────────────────────────────────────────────────
const AssignDropdown = ({ value, options, placeholder, onChange, saving, disabled }) => (
  <div className="relative">
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      disabled={saving || disabled}
      className="appearance-none w-full pl-2.5 pr-6 py-1 rounded-lg text-[11px] font-medium border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-w-[110px]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
    <svg
      className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return (
      <svg className="w-3 h-3 opacity-20 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  return sortDir === "asc" ? (
    <svg className="w-3 h-3 ml-1 inline text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3 ml-1 inline text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

// ─── Inline action buttons ────────────────────────────────────────────────────
const ActionButtons = ({ onView, onEdit, disableEdit }) => (
  <div className="flex items-center gap-1.5">
    <button
      onClick={onView}
      title="View"
      className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>

    <button
      onClick={!disableEdit ? onEdit : undefined}
      disabled={disableEdit}
      title={disableEdit ? "Locked — cannot edit this request" : "Edit / Admin Remarks"}
      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition
        ${disableEdit
          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
          : "bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200 cursor-pointer"
        }`}
    >
      {disableEdit ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
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

const ALL_STATUSES = ["All", "PENDING", "APPROVED", "DISAPPROVED", "CANCELLED"];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRequestStatus() {
  const [data, setData]                       = useState([]);
  const [drivers, setDrivers]                 = useState([]);
  const [vehicles, setVehicles]               = useState([]);
  const [search, setSearch]                   = useState("");
  const [statusFilter, setStatusFilter]       = useState("All");
  const [loading, setLoading]                 = useState(true);
  const [modalState, setModalState]           = useState(null);
  const [saving, setSaving]                   = useState({});
  const [selected, setSelected]               = useState(new Set());
  const [sortCol, setSortCol]                 = useState("date_of_travel");
  const [sortDir, setSortDir]                 = useState("desc");
  const [deleting, setDeleting]               = useState(false);
  const [deleteConfirm, setDeleteConfirm]     = useState(false);
  const [generatingTicket, setGeneratingTicket] = useState(false); // ← moved inside

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
      if (field === "status" && value === "APPROVED") {
        await apiFetch(`/requests/${id}/approve/`, { method: "POST" });
      } else if (field === "status" && value === "DISAPPROVED") {
        await apiFetch(`/requests/${id}/disapprove/`, { method: "POST" });
      } else {
        await apiFetch(`/requests/${id}/`, { method: "PATCH", body: JSON.stringify({ [field]: value }) });
      }
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

  const handleSort = (col) => {
    setSortDir((d) => sortCol === col ? (d === "asc" ? "desc" : "asc") : "asc");
    setSortCol(col);
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    setDeleteConfirm(true);
  };

  const handleGenerateTripTickets = async () => {
    if (selected.size === 0) return;
    const driversMap  = Object.fromEntries(drivers.map((d) => [d.id, d.label]));
    const vehiclesMap = Object.fromEntries(vehicles.map((v) => [v.id, v.label]));
    const selectedRequests = data.filter((r) => selected.has(r.id));
    setGeneratingTicket(true);
    try {
      await generateTripTicket(
        selectedRequests,
        driversMap,
        vehiclesMap,
        TEMPLATE_URL,
        { oneFilePerRequest: selected.size === 1 }
      );
    } catch (err) {
      console.error("Trip ticket generation failed:", err);
      alert("Failed to generate trip ticket.\nCheck console for details.");
    } finally {
      setGeneratingTicket(false);
    }
  };

  const confirmDelete = async () => {
    const ids = [...selected];
    setDeleting(true);
    try {
      await Promise.all(
        ids.map(async (id) => {
          const req = data.find((r) => r.id === id);
          if (req?.trip) {
            try {
              await apiFetch(`/trips/${req.trip}/`, { method: "DELETE" });
            } catch (err) {
              console.warn(`Trip ${req.trip} delete failed (may not exist):`, err);
            }
          }
          await apiFetch(`/requests/${id}/`, { method: "DELETE" });
        })
      );
      setData((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
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

  const openModal   = (item, mode = "view") => setModalState({ request: buildRequest(item), mode });
  const allSelected = processedData.length > 0 && processedData.every((r) => selected.has(r.id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(processedData.map((r) => r.id)));
  const toggleOne   = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>

      {modalState && (
        <ViewRequestModal
          request={modalState.request}
          initialMode={modalState.mode}
          isAdmin
          onClose={() => setModalState(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          count={selected.size}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Travel Requests</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.slice(1).map((s) => {
            const cfg    = getStatusCfg(s);
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? "All" : s)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border text-xs font-medium transition shadow-sm ${
                  active
                    ? "border-emerald-400 ring-1 ring-emerald-200 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className={`font-bold ml-0.5 ${active ? "text-emerald-600" : "text-slate-400"}`}>
                  {counts[s] ?? 0}
                </span>
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
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder-slate-400 text-slate-700 w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-700"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Status" : getStatusCfg(s).label}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              value={sortCol}
              onChange={(e) => setSortCol(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-700"
            >
              {SORTABLE_COLS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {selected.size > 0 && (
              <>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {selected.size} selected
                </span>

                {/* ── Trip Ticket button ── */}
                <button
                  onClick={handleGenerateTripTickets}
                  disabled={generatingTicket}
                  title="Generate Driver's Trip Ticket (.xlsx)"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-xs font-medium text-sky-600 hover:bg-sky-100 transition disabled:opacity-50"
                >
                  {generatingTicket ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  Trip Ticket{selected.size > 1 ? "s" : ""}
                </button>

                {/* ── Delete button ── */}
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            )}
            <span className="text-xs text-slate-400">{processedData.length} / {data.length}</span>
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col style={{ width: "30px" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "7%" }} />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-500 cursor-pointer"
                />
              </th>
              {[
                { label: "Name",        col: "name" },
                { label: "Date",        col: "created_at" },
                { label: "Department",  col: "department" },
                { label: "Travel Date", col: "date_of_travel" },
                { label: "Destination", col: "destination" },
                { label: "Status",      col: "status" },
                { label: "Driver",      col: null },
                { label: "Vehicle",     col: null },
                { label: "Action",      col: null },
              ].map(({ label, col }) => (
                <th
                  key={label}
                  onClick={() => col && handleSort(col)}
                  className={`px-3 py-3 text-left select-none whitespace-nowrap ${col ? "cursor-pointer hover:text-emerald-600" : ""}`}
                >
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
                      <td key={j} className="px-3 py-4">
                        <div className="h-3 bg-slate-100 rounded" />
                      </td>
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
                  const statusUp      = (item.status || "").toUpperCase();
                  const isCancelled   = statusUp === "CANCELLED";
                  const isDisapproved = statusUp === "DISAPPROVED";
                  const isLocked      = isCancelled || isDisapproved;
                  const isSelected    = selected.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCancelled
                          ? "opacity-60"
                          : isDisapproved
                          ? "bg-red-50/50 hover:bg-red-50 border-l-2 border-l-red-300"
                          : isSelected
                          ? "bg-emerald-50/40"
                          : "hover:bg-slate-50/80"
                      }`}
                      style={
                        isCancelled
                          ? {
                              backgroundImage:
                                "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(148,163,184,0.08) 6px, rgba(148,163,184,0.08) 12px)",
                            }
                          : undefined
                      }
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isCancelled && toggleOne(item.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0
                              ${isCancelled
                                ? "bg-slate-300"
                                : `bg-gradient-to-br ${avatarColor(item.name)}`
                              }`}
                          >
                            {(item.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 truncate text-[12px] leading-tight">{item.name || "—"}</p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{item.immediate_head || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="px-3 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {fmtTravelDate(item.created_at || "—")}
                      </td>

                      {/* Department */}
                      <td className="px-3 py-3.5 text-slate-500 text-[11px] truncate">
                        {item.department || "—"}
                      </td>

                      {/* Travel Date */}
                      <td className="px-3 py-3.5 text-slate-600 text-[11px] whitespace-nowrap">
                        {fmtTravelDate(item.date_of_travel, item.date_of_returned)}
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
                          disabled={isLocked}
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
                          disabled={isLocked}
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
                          disabled={isLocked}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5">
                        <ActionButtons
                          onView={() => openModal(item, "view")}
                          onEdit={() => openModal(item, "adminEdit")}
                          disableEdit={isLocked}
                        />
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>

        {!loading && data.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {processedData.length} of {data.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}