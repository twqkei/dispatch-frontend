import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./trip.css";
import { createPortal } from "react-dom";
import { apiFetch } from "./api";

const toTimeInput = (t) => (t ? String(t).slice(0, 5) : "");
const fromTimeInput = (t) => (t ? `${t}:00` : null);

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
      const picked = filtered[active] || q;
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
              {filtered.slice(0, 60).map((opt, idx) => {
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
              })}
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

  const saveTimeout = useRef({});

  const statuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

  useEffect(() => {
    (async () => {
      const data = await apiFetch(`/trips/by_date/?date=${encodeURIComponent(date)}`);
      setTrips(Array.isArray(data) ? data : []);
    })();
  }, [date]);

  useEffect(() => {
    (async () => {
      setDrivers(await apiFetch("/drivers/"));
      setVehicles(await apiFetch("/vehicles/"));
    })();
  }, []);

  const patchTrip = async (id, patch) => {
    return apiFetch(`/trips/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  };

  const handleDriverSelect = (index, name) => {
    const selected = drivers.find((d) => d.name === name);
    if (!selected) return;

    const trip = trips[index];

    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        driver: selected.id,
        driver_name: selected.name,
      };
      return copy;
    });

    patchTrip(trip.id, { driver: selected.id });
  };

  const handleVehicleSelect = (index, value) => {
    const selected = vehicles.find(
      (v) => `${v.plate_number} | ${v.model}` === value
    );
    if (!selected) return;

    const trip = trips[index];
    const display = `${selected.plate_number} | ${selected.model}`;

    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        vehicle: selected.id,
        vehicle_name: display,
      };
      return copy;
    });

    patchTrip(trip.id, { vehicle: selected.id });
  };

  return (
    <div className="trip-page">
      <div className="trip-topbar">
        <div>
          <div className="trip-title">
            <h1>Trips on {date}</h1>
          </div>
          <Link to="/home" className="trip-back">
            ← Back to Calendar
          </Link>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card__inner">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Destination</th>
              </tr>
            </thead>

            <tbody>
              {trips.map((trip, i) => {
                const vehicleOptions = vehicles.map(
                  (v) => `${v.plate_number} | ${v.model}`
                );
                const driverOptions = drivers.map((d) => d.name);

                return (
                  <tr key={trip.id}>
                    <td>
                      <InlinePicker
                        value={trip.vehicle_name || ""}
                        options={vehicleOptions}
                        onSelect={(v) => handleVehicleSelect(i, v)}
                      />
                    </td>

                    <td>
                      <InlinePicker
                        value={trip.driver_name || ""}
                        options={driverOptions}
                        onSelect={(v) => handleDriverSelect(i, v)}
                      />
                    </td>

                    <td>{trip.status}</td>

                    <td>
                      <textarea
                        className="cell-input cell-input--textarea"
                        value={trip.destination || ""}
                        onChange={(e) =>
                          setTrips((prev) => {
                            const copy = [...prev];
                            copy[i].destination = e.target.value;
                            return copy;
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Trip;