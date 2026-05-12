import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CalendarComponent from "./calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { apiFetch } from "./api";
import { FaPlus } from "react-icons/fa";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const STATUS_ORDER = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const STATUS_CONFIG = {
  ONGOING:   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  UPCOMING:  { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  COMPLETED: { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400",   badge: "bg-slate-100 text-slate-500 ring-slate-200" },
  CANCELLED: { bg: "bg-rose-50",     text: "text-rose-600",    dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-600 ring-rose-200" },
};

/* ── Status Badge ─────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 whitespace-nowrap ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

/* ── Task Card ────────────────────────────────── */
function TaskCard({ trip, onStatusChange }) {
  const status = trip.status || "UPCOMING";
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

  const closeMenu = useCallback(() => setMenu((p) => ({ ...p, visible: false })), []);

  useEffect(() => {
    if (!menu.visible) return;
    const onClick  = () => closeMenu();
    const onEscape = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onEscape);
    return () => { window.removeEventListener("click", onClick); window.removeEventListener("keydown", onEscape); };
  }, [menu.visible, closeMenu]);

  return (
    <>
      <div
        className="bg-white border border-slate-200 rounded-2xl p-3.5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        onContextMenu={(e) => { e.preventDefault(); setMenu({ visible: true, x: e.clientX, y: e.clientY }); }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className="font-bold text-sm text-slate-800 truncate">
              {trip.vehicle_name || "No vehicle"}
            </div>
            <div className="flex flex-col gap-0.5 text-xs text-slate-500 leading-relaxed">
              <span>{trip.driver_name ? `🧑‍✈️ ${trip.driver_name}` : "No driver"}</span>
              <span className="truncate">{trip.destination ? `📍 ${trip.destination}` : "No destination"}</span>
              <span>{trip.time_of_travel ? `🕐 ${trip.time_of_travel}` : "No time"}</span>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Right-click context menu */}
      {menu.visible && (
        <div
          className="fixed z-[9999] bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 w-48"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Change Status
          </div>
          {STATUS_ORDER.map((option) => {
            const c = STATUS_CONFIG[option] || STATUS_CONFIG.UPCOMING;
            return (
              <button
                key={option}
                className="w-full flex items-center px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                onClick={() => { onStatusChange(trip.id, option); closeMenu(); }}
              >
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${c.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ── Column ───────────────────────────────────── */
function Column({ title, items, renderItem }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-2 px-1">
        <h3 className="flex-1 font-bold text-sm text-slate-700">{title}</h3>
      </div>
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id || JSON.stringify(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Home ─────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [tripData, setTripData]       = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const loadTrips = useCallback(async () => {
    try {
      const data = await apiFetch("/trips/");
      setTripData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTripData([]);
    }
  }, []);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const getTripsForDate = useCallback(
    (date) => tripData.filter((trip) => trip.date_of_trip === toISO(date)),
    [tripData]
  );

  const tripsForDay = useMemo(() =>
    [...getTripsForDate(selectedDate)].sort((a, b) =>
      (a.time_of_travel || "99:99:99").localeCompare(b.time_of_travel || "99:99:99")
    ), [getTripsForDate, selectedDate]
  );

  const groupedTrips = useMemo(() => ({
    UPCOMING:  tripsForDay.filter((t) => t.status === "UPCOMING"),
    ONGOING:   tripsForDay.filter((t) => t.status === "ONGOING"),
    COMPLETED: tripsForDay.filter((t) => t.status === "COMPLETED"),
    CANCELLED: tripsForDay.filter((t) => t.status === "CANCELLED"),
  }), [tripsForDay]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const tabs  = useMemo(() => [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)], [selectedDate]);

  const handleStatusChange = async (tripId, newStatus) => {
    const prev = tripData;
    setTripData((p) => p.map((t) => t.id === tripId ? { ...t, status: newStatus, manual_status: true } : t));
    try {
      await apiFetch(`/trips/${tripId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, manual_status: true }),
      });
      await loadTrips();
    } catch (e) {
      console.error(e);
      setTripData(prev);
    }
  };

  const hasTrips = tripsForDay.length > 0;

  /* summary counts */
  const summary = useMemo(() => ({
    total:     tripsForDay.length,
    upcoming:  groupedTrips.UPCOMING.length,
    ongoing:   groupedTrips.ONGOING.length,
    cancelled: groupedTrips.CANCELLED.length,
  }), [tripsForDay, groupedTrips]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-[1400px] mx-auto font-sans">

      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200 mb-4 flex-wrap">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-emerald-300 shrink-0" />

        {/* Date nav */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <button
            onClick={() => setSelectedDate((d) => startOfDay(addDays(d, -1)))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors text-lg font-bold"
          >‹</button>

          <div className="flex gap-1.5 flex-wrap">
            {tabs.map((date) => (
              <button
                key={toISO(date)}
                onClick={() => setSelectedDate(startOfDay(date))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  sameDay(date, selectedDate)
                    ? "bg-slate-800 text-white"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {sameDay(date, today)
                  ? "Today"
                  : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedDate((d) => startOfDay(addDays(d, 1)))}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors text-lg font-bold"
          >›</button>
        </div>

        {/* Add trip */}
        <button
          onClick={() => navigate("/trips/new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0"
        >
          <FaPlus className="text-[10px]" />
          Add New Trip
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "minmax(320px,1.2fr) minmax(0,2fr)" }}>

        {/* Left — Calendar + Summary */}
        <div className="flex flex-col gap-4">
          {/* Calendar card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
            <CalendarComponent
              value={selectedDate}
              onDateClick={(date) => navigate(`/trips/${toISO(date)}`)}
              getTripsForDate={getTripsForDate}
            />
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200">
                Total {summary.total}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                Upcoming {summary.upcoming}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                Ongoing {summary.ongoing}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                Cancelled {summary.cancelled}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Trip columns */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", alignItems: "start" }}>
          {hasTrips ? (
            Object.entries(groupedTrips)
              .filter(([, trips]) => trips.length > 0)
              .map(([section, trips]) => (
                <Column
                  key={section}
                  title={`${section.charAt(0) + section.slice(1).toLowerCase()} (${trips.length})`}
                  items={trips}
                  renderItem={(trip) => (
                    <TaskCard trip={trip} onStatusChange={handleStatusChange} />
                  )}
                />
              ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="text-4xl mb-3">🗓</div>
              <p className="text-sm font-medium">No trips scheduled for this day</p>
              <button
                onClick={() => navigate("/trips/new")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                + Add Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}