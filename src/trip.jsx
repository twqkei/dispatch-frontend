import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch } from "./api";

const SHEETDB_URL = "https://sheetdb.io/api/v1/cyqjdv9avucvn";

const toTimeInput = (t) => (t ? String(t).slice(0, 5) : "");
const fromTimeInput = (t) => (t ? `${t}:00` : null);

/* ── Tone helpers ─────────────────────────────────── */
const STATUS_TONE = {
  UPCOMING: "amber",
  ONGOING: "green",
  COMPLETED: "slate",
  CANCELLED: "rose",
};

const TONE_CLASSES = {
  green:   "bg-green-100 text-green-800",
  amber:   "bg-amber-100 text-amber-800",
  red:     "bg-red-100 text-red-800",
  blue:    "bg-blue-100 text-blue-800",
  indigo:  "bg-indigo-100 text-indigo-800",
  gray:    "bg-gray-100 text-gray-600",
  emerald: "bg-emerald-100 text-emerald-800",
  rose:    "bg-rose-100 text-rose-800",
  slate:   "bg-slate-100 text-slate-600",
};

const toneFromText = (text) => {
  if (!text) return "gray";
  const tones = ["green", "amber", "red", "blue", "indigo", "gray"];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return tones[hash % tones.length];
};

const toneForStatus = (v) => STATUS_TONE[v] || "gray";

/* ── InlinePicker ─────────────────────────────────── */
function InlinePicker({ value, placeholder = "Select", options = [], getTone, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });

  const rootRef  = useRef(null);
  const btnRef   = useRef(null);
  const inputRef = useRef(null);

  const tone      = getTone?.(value) || "gray";
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.gray;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query ? options.filter((o) => o.toLowerCase().includes(query)) : options;
  }, [q, options]);

  const computePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r     = el.getBoundingClientRect();
    const width = 280;
    const left  = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const top   = Math.min(r.bottom + 6, window.innerHeight - 340);
    setPos({ top, left, width });
  };

  useEffect(() => {
    const onDocClick = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onResizeOrScroll = () => { if (open) computePos(); };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setQ(""); setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const openPopover = () => { computePos(); setOpen(true); };
  const selectValue = (v) => { onSelect(v); setOpen(false); };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "Escape")    { e.preventDefault(); setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, Math.max(0, filtered.length - 1))); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); return; }
    if (e.key === "Enter")     { e.preventDefault(); const picked = filtered[active] || q; if (picked) selectValue(picked); }
  };

  return (
    <div className="relative flex items-center" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        title={value || placeholder}
        className={`inline-flex items-center max-w-full rounded-full px-2.5 py-1 text-xs font-semibold border border-black/5 cursor-pointer whitespace-nowrap truncate leading-tight transition-opacity hover:opacity-80 ${
          value ? toneClass : "bg-gray-100 text-gray-400"
        }`}
      >
        <span className="max-w-[120px] truncate">{value || placeholder}</span>
      </button>

      {open && createPortal(
        <div
          className="fixed bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 z-[999999]"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={onKeyDown}
        >
          <div className="px-1.5 pb-2 pt-1">
            <input
              ref={inputRef}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-700 placeholder-slate-400"
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              placeholder="Type to search…"
            />
          </div>
          <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5 px-1">
            {filtered.length === 0 ? (
              <button className="text-left px-2 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 font-medium" onClick={() => selectValue(q)}>
                ➕ Add "{q}"
              </button>
            ) : (
              filtered.slice(0, 60).map((opt, idx) => {
                const optTone  = getTone?.(opt) || "gray";
                const optClass = TONE_CLASSES[optTone] || TONE_CLASSES.gray;
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`flex items-center px-2 py-1.5 rounded-lg cursor-pointer border-none text-left transition-colors ${idx === active ? "bg-blue-50" : "hover:bg-slate-50"}`}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => selectValue(opt)}
                  >
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${optClass}`}>{opt}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Trip page ────────────────────────────────────── */
function Trip() {
  const { date } = useParams();
  const [trips, setTrips]       = useState([]);
  const [drivers, setDrivers]   = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tableQuery, setTableQuery] = useState("");
  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState(null); // { type: "success"|"info"|"error", text }

  const saveTimeout = useRef({});

  const statuses  = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
  const requesters = [
    "IAAS","IADS","ILEGG","IC","ITED","OSDS","Cashier","REP","HRMO","PSU","Supply",
    "PRMO","QA","PIO","Record Management Office","BASD","VPAA","VPAF","VPREP","Extension Division",
    "Research Development Division","Production Division","Carmen Campus","TBI","Engineering Office",
    "GAD","Internalization","Office of the President","Quality Assurance","GASSO","Faculty Association",
    "Admin Services","Registrar","Accounting Office","GSU","Other Agency","OP","Budget","BOARD SEC",
    "External Visitors","Samal Campus","BAC","SETBI","Admission Office",
  ];

  /* ── Load trips for this date ── */
  const loadTrips = async () => {
    try {
      const data = await apiFetch(`/trips/by_date/?date=${encodeURIComponent(date)}`, { method: "GET" });
      setTrips(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setTrips([]); }
  };

  useEffect(() => {
    loadTrips();
  }, [date]);

  useEffect(() => {
    (async () => {
      try { const d = await apiFetch("/drivers/");  setDrivers(Array.isArray(d)  ? d  : []); } catch (e) { console.error(e); }
      try { const v = await apiFetch("/vehicles/"); setVehicles(Array.isArray(v) ? v : []); } catch (e) { console.error(e); }
    })();
  }, []);

  /* ── Sync approved requests from SheetDB ── */
  const syncApprovedRequests = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      // 1. Fetch all rows from SheetDB
      const res  = await fetch(SHEETDB_URL);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : (data.data ?? []);

      // 2. Filter: STATUS = "Approved" AND Date of Travel matches this page's date
      //    SheetDB stores dates as the user typed them (e.g. "2025-07-15")
      const approved = rows.filter(
        (r) => r["STATUS"] === "Approved" && r["Date of Travel"] === date
      );

      if (approved.length === 0) {
        setSyncMsg({ type: "info", text: "No approved requests found for this date." });
        return;
      }

      // 3. Fetch current trips again (fresh) to avoid duplicates
      const current = await apiFetch(`/trips/by_date/?date=${encodeURIComponent(date)}`, { method: "GET" });
      const existing = Array.isArray(current) ? current : [];

      // 4. Deduplicate: match on destination + time_of_travel + requester
      //    (since we have no shared ID between SheetDB and your backend)
      let created = 0;
      for (const req of approved) {
        const timeVal  = req["Time of Departure"] ? `${req["Time of Departure"]}:00` : null;
        const destVal  = (req["Travel Destination"] || "").trim();
        const deptVal  = (req["Department / Office"] || "").trim();

        const alreadyExists = existing.some(
          (t) =>
            (t.destination || "").trim() === destVal &&
            toTimeInput(t.time_of_travel) === toTimeInput(timeVal) &&
            (t.requester || "").trim() === deptVal
        );

        if (alreadyExists) continue;

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
          `Name: ${req["Name:"] || ""}`,
        ].filter(Boolean).join(" | ");

        await apiFetch("/trips/", {
          method: "POST",
          body: JSON.stringify({
            vehicle: null,
            driver: null,
            status: "UPCOMING",
            destination: destVal,
            date_of_trip: date,
            time_of_travel: timeVal,
            date_requested: new Date().toISOString().slice(0, 10),
            requester: deptVal,
            passengers: parseInt(req["Number of Passengers"], 10) || 0,
            remarks: remarksLines,
          }),
        });
        created++;
      }

      // 5. Reload trips to show newly created ones
      await loadTrips();

      setSyncMsg(
        created > 0
          ? { type: "success", text: `${created} approved request${created > 1 ? "s" : ""} added as trip${created > 1 ? "s" : ""}.` }
          : { type: "info",    text: "All approved requests are already on the schedule." }
      );
    } catch (e) {
      console.error(e);
      setSyncMsg({ type: "error", text: "Sync failed. Please try again." });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  };

  /* Auto-sync once on mount */
  useEffect(() => {
    syncApprovedRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  /* ── Trip helpers ── */
  const activeTrips = useMemo(
    () => trips.filter((t) => ["UPCOMING", "ONGOING"].includes(t.status)),
    [trips]
  );

  const baseAssignableVehicles = useMemo(
    () => vehicles.filter((v) => v.condition === "READY_TO_USE" && v.availability !== "UNAVAILABLE"),
    [vehicles]
  );

  const patchTrip = (id, patch) => {
    const payload = { ...patch };
    ["date_requested", "time_of_travel"].forEach((f) => { if (payload[f] === "") payload[f] = null; });
    return apiFetch(`/trips/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  };

  const handleChange = (index, field, value) => {
    setTrips((prev) => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });
    const trip = trips[index];
    if (!trip) return;
    clearTimeout(saveTimeout.current[trip.id]);
    saveTimeout.current[trip.id] = setTimeout(() => patchTrip(trip.id, { [field]: value }).catch(console.error), 600);
  };

  const handleDriverSelect = (index, name, optionsForRow) => {
    const selectedDriver = optionsForRow.find((d) => d.name === name);
    if (!selectedDriver) return;
    const trip = trips[index];
    if (!trip) return;
    setTrips((prev) => { const copy = [...prev]; copy[index] = { ...copy[index], driver: selectedDriver.id, driver_name: selectedDriver.name }; return copy; });
    clearTimeout(saveTimeout.current[trip.id]);
    saveTimeout.current[trip.id] = setTimeout(() => patchTrip(trip.id, { driver: selectedDriver.id }).catch(console.error), 600);
  };

  const handleVehicleSelect = (index, displayValue, optionsForRow) => {
    const selectedVehicle = optionsForRow.find((v) => v.model === displayValue);
    if (!selectedVehicle) return;
    const trip = trips[index];
    if (!trip) return;
    setTrips((prev) => { const copy = [...prev]; copy[index] = { ...copy[index], vehicle: selectedVehicle.id, vehicle_name: selectedVehicle.model }; return copy; });
    clearTimeout(saveTimeout.current[trip.id]);
    saveTimeout.current[trip.id] = setTimeout(() => patchTrip(trip.id, { vehicle: selectedVehicle.id }).catch(console.error), 600);
  };

  const deleteTrip = (id) => {
    if (!window.confirm("Delete this trip?")) return;
    apiFetch(`/trips/${id}/`, { method: "DELETE" })
      .then(() => setTrips((prev) => prev.filter((t) => t.id !== id)))
      .catch(console.error);
  };

  const filteredTrips = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) =>
      [t.vehicle_name, t.driver_name, t.status, t.destination, t.requester, t.remarks, String(t.passengers ?? ""), String(t.date_requested ?? ""), String(t.time_of_travel ?? "")]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [trips, tableQuery]);

  const getAvailableVehiclesForRow = (rowTrip) => {
    const usedIds = new Set(activeTrips.filter((t) => t.id !== rowTrip.id && t.vehicle).map((t) => t.vehicle));
    const current = rowTrip.vehicle != null ? vehicles.find((v) => v.id === rowTrip.vehicle) : null;
    const allowed = baseAssignableVehicles.filter((v) => !usedIds.has(v.id));
    return current && !allowed.some((v) => v.id === current.id) ? [current, ...allowed] : allowed;
  };

  const getAvailableDriversForRow = (rowTrip) => {
    const usedIds = new Set(activeTrips.filter((t) => t.id !== rowTrip.id && t.driver).map((t) => t.driver));
    const current = rowTrip.driver != null ? drivers.find((d) => d.id === rowTrip.driver) : null;
    const allowed = drivers.filter((d) => !usedIds.has(d.id));
    return current && !allowed.some((d) => d.id === current.id) ? [current, ...allowed] : allowed;
  };

  const cellInput = "w-full bg-transparent border border-transparent rounded-lg px-1.5 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

  const syncMsgColors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    "bg-blue-50 border-blue-200 text-blue-700",
    error:   "bg-rose-50 border-rose-200 text-rose-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">

      {/* Topbar */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trips on {date}</h1>
          <Link to="/home" className="text-sm text-slate-400 hover:text-slate-600 transition-colors mt-0.5 inline-block">
            ← Back to Calendar
          </Link>
        </div>

        {/* Sync button */}
        <button
          onClick={syncApprovedRequests}
          disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.582M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9" />
          </svg>
          {syncing ? "Syncing…" : "Sync Approved Requests"}
        </button>
      </div>

      {/* Sync message banner */}
      {syncMsg && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${syncMsgColors[syncMsg.type]}`}>
          <span>{syncMsg.type === "success" ? "✓" : syncMsg.type === "error" ? "✕" : "ℹ"}</span>
          {syncMsg.text}
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-slate-400 text-slate-700"
              value={tableQuery}
              onChange={(e) => setTableQuery(e.target.value)}
              placeholder="Search trips…"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          <table className="w-full border-collapse text-xs" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 96  }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 54  }} />
              <col style={{ width: 108 }} />
              <col style={{ width: 80  }} />
            </colgroup>

            <thead>
              <tr>
                {["Vehicle","Driver","Status","Destination","Time of Travel","Requester","Remarks","Pax","Date Req.",""].map((h, i) => (
                  <th key={i} className="sticky top-0 z-10 bg-slate-50 px-2.5 py-2 text-left text-[10px] font-700 uppercase tracking-wider text-slate-400 border-b border-slate-200 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-400 text-sm">
                    {syncing ? "Checking for approved requests…" : "No trips found"}
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const i = trips.findIndex((t) => t.id === trip.id);
                  const availableVehicles = getAvailableVehiclesForRow(trip);
                  const availableDrivers  = getAvailableDriversForRow(trip);

                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/70 transition-colors">

                      {/* Vehicle */}
                      <td className="px-2 py-1.5 align-middle">
                        <InlinePicker value={trip.vehicle_name || ""} placeholder="Vehicle" options={availableVehicles.map((v) => v.model)} getTone={toneFromText} onSelect={(v) => handleVehicleSelect(i, v, availableVehicles)} />
                      </td>

                      {/* Driver */}
                      <td className="px-2 py-1.5 align-middle">
                        <InlinePicker value={trip.driver_name || ""} placeholder="Driver" options={availableDrivers.map((d) => d.name)} getTone={toneFromText} onSelect={(v) => handleDriverSelect(i, v, availableDrivers)} />
                      </td>

                      {/* Status */}
                      <td className="px-2 py-1.5 align-middle">
                        <InlinePicker value={trip.status || ""} placeholder="Status" options={statuses} getTone={toneForStatus} onSelect={(v) => handleChange(i, "status", v)} />
                      </td>

                      {/* Destination */}
                      <td className="px-2 py-1.5 align-top">
                        <textarea className={`${cellInput} resize-none min-h-[28px] whitespace-pre-wrap`} value={trip.destination || ""} onChange={(e) => handleChange(i, "destination", e.target.value)} />
                      </td>

                      {/* Time */}
                      <td className="px-2 py-1.5 align-middle">
                        <input type="time" className={cellInput} value={toTimeInput(trip.time_of_travel)} onChange={(e) => handleChange(i, "time_of_travel", fromTimeInput(e.target.value))} />
                      </td>

                      {/* Requester */}
                      <td className="px-2 py-1.5 align-middle">
                        <InlinePicker value={trip.requester || ""} placeholder="Requester" options={requesters} getTone={toneFromText} onSelect={(v) => handleChange(i, "requester", v)} />
                      </td>

                      {/* Remarks */}
                      <td className="px-2 py-1.5 align-top">
                        <textarea className={`${cellInput} resize-none min-h-[28px] whitespace-pre-wrap`} value={trip.remarks || ""} onChange={(e) => handleChange(i, "remarks", e.target.value)} placeholder="Remarks…" />
                      </td>

                      {/* Pax */}
                      <td className="px-2 py-1.5 align-middle">
                        <input type="number" min="0" className={`${cellInput} text-right`} value={trip.passengers ?? 0} onChange={(e) => handleChange(i, "passengers", parseInt(e.target.value, 10) || 0)} />
                      </td>

                      {/* Date Requested */}
                      <td className="px-2 py-1.5 align-middle">
                        <input type="date" className={cellInput} value={trip.date_requested || ""} onChange={(e) => handleChange(i, "date_requested", e.target.value || null)} />
                      </td>

                      {/* Delete */}
                      <td className="px-2 py-1.5 align-middle text-right">
                        <button onClick={() => deleteTrip(trip.id)} className="px-2.5 py-1 text-[11px] font-semibold text-red-400 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                          Delete
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
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {filteredTrips.length} of {trips.length} trips
          </span>
        </div>
      </div>
    </div>
  );
}

export default Trip;