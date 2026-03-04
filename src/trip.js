import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { apiFetch } from "./api"; // ✅ centralized API
import "./trip.css";

const toTimeInput = (t) => (t ? String(t).slice(0, 5) : "");
const fromTimeInput = (t) => (t ? `${t}:00` : null);

/* ---------- Notion-like picker (WITH search) ---------- */
function InlinePicker({ value, placeholder = "Select", options = [], getTone, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 260 });

  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const inputRef = useRef(null);

  const tone = getTone?.(value) || "gray";

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;
    return options.filter((o) => o.toLowerCase().includes(query));
  }, [q, options]);

  const computePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = 280;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const top = Math.min(r.bottom + 8, window.innerHeight - 340);
    setPos({ top, left, width });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };

    const onResizeOrScroll = () => {
      if (!open) return;
      computePos();
    };

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
    setQ("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const openPopover = () => {
    computePos();
    setOpen(true);
  };

  const selectValue = (v) => {
    onSelect(v);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, filtered.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const picked = filtered[active];
      if (picked) selectValue(picked);
    }
  };

  return (
    <div className="inline-picker" ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className={`tag tag--${tone} ${value ? "" : "tag--empty"}`}
        onClick={() => (open ? setOpen(false) : openPopover())}
        title={value || placeholder}
      >
        <span className="tag__text">{value || placeholder}</span>
      </button>

      {open &&
        createPortal(
          <div
            className="picker-pop picker-pop--portal"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="picker-search">
              <input
                ref={inputRef}
                className="picker-search__input"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Type to search…"
              />
            </div>

            <div className="picker-list">
              {filtered.length === 0 ? (
                <div className="picker-empty">No matches</div>
              ) : (
                filtered.slice(0, 60).map((opt, idx) => {
                  const optTone = getTone?.(opt) || "gray";
                  const isActive = idx === active;

                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`picker-item ${isActive ? "picker-item--active" : ""}`}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => selectValue(opt)}
                    >
                      <span className={`tag tag--${optTone}`}>{opt}</span>
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

function Trip() {
  const { date } = useParams();
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tableQuery, setTableQuery] = useState("");

  const conditions = ["READY TO USE", "FOR REPAIR", "FOR DISPOSAL", "Insurance Registration"];
  const availabilities = ["Available", "Unavailable", "Repair", "Cancelled"];

  /* Fetch trips by date */
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/trips/by_date/?date=${encodeURIComponent(date)}`);
        setTrips(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Fetch trips error:", e);
        setTrips([]);
      }
    })();
  }, [date]);

  /* Fetch drivers + vehicles */
  useEffect(() => {
    (async () => {
      try {
        const d = await apiFetch("/drivers/");
        setDrivers(Array.isArray(d) ? d : []);
      } catch (e) {
        console.error(e);
      }

      try {
        const v = await apiFetch("/vehicles/");
        setVehicles(Array.isArray(v) ? v : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const vehicleOptions = useMemo(
    () => [...new Set(vehicles.map((v) => v.model).filter(Boolean))],
    [vehicles]
  );

  const driverOptions = useMemo(
    () => [...new Set(drivers.map((d) => d.name).filter(Boolean))],
    [drivers]
  );

  const patchTrip = async (id, patch) => {
    return apiFetch(`/trips/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  };

  const handleChange = (index, field, value) => {
    setTrips((prev) => {
      const original = prev[index];
      const updated = [...prev];
      updated[index] = { ...original, [field]: value };

      patchTrip(original.id, { [field]: value })
        .then((serverTrip) => {
          if (!serverTrip) return;
          setTrips((curr) =>
            curr.map((t) => (t.id === serverTrip.id ? serverTrip : t))
          );
        })
        .catch((err) => {
          console.error("PATCH failed:", err);
        });

      return updated;
    });
  };

  const addRow = () => {
    apiFetch("/trips/", {
      method: "POST",
      body: JSON.stringify({ date_of_trip: date }),
    })
      .then((data) => setTrips((prev) => [...prev, data]))
      .catch(console.error);
  };

  const deleteTrip = (id) => {
    if (!window.confirm("Delete this trip?")) return;
    apiFetch(`/trips/${id}/`, { method: "DELETE" })
      .then(() => setTrips((prev) => prev.filter((t) => t.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="trip-page">
      <div className="trip-topbar">
        <div>
          <h1>Trips on {date}</h1>
          <Link to="/home" className="trip-back">
            ← Back to Calendar
          </Link>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <input
            className="table-search"
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
            placeholder="Search"
          />
          <button onClick={addRow} className="btn-primary-soft">
            + Add Trip
          </button>
        </div>
      </div>
    </div>
  );
}

export default Trip;