import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./trip.css";
import { createPortal } from "react-dom";

/* ---------- helpers for time input ---------- */
const toTimeInput = (t) => (t ? String(t).slice(0, 5) : "");
const fromTimeInput = (t) => (t ? `${t}:00` : null);

/* ---------- Notion-like picker (WITH search) ---------- */
function InlinePicker({
  value,
  placeholder = "Select",
  options = [],
  getTone,
  onSelect,
}) {
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
                      className={`picker-item ${
                        isActive ? "picker-item--active" : ""
                      }`}
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
  const requesters = [
    "IAAS","IADS","ILEGG","IC","ITED","OSDS","Cashier","REP","HRMO","PSU","Supply",
    "PRMO","QA","PIO","Record Management Office", "BASD","VPAA","VPAF","VPREP","Extension Division",
    "Research Development Division","Production Division","Carmen Campus","TBI","Engineering Office",
    "GAD","Internalization","Office of the President","Quality Assurance","GASSO","Faculty Association",
    "Admin Services","Registrar","Accounting Office","GSU","Other Agency","OP","Budget","BOARD SEC","External Visitors",
    "Samal Campus", "BAC"
  ];

  // Fetch trips by date
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/trips/by_date/?date=${date}`)
      .then((res) => res.json())
      .then((data) => setTrips(data));
  }, [date]);

  // Fetch drivers and vehicles
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/drivers/")
      .then((res) => res.json())
      .then((data) => setDrivers(data));

    fetch("http://127.0.0.1:8000/api/vehicles/")
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  }, []);

  // safer options (unique, no undefined)
  const vehicleOptions = useMemo(
    () => [...new Set(vehicles.map((v) => v.model).filter(Boolean))],
    [vehicles]
  );

  const driverOptions = useMemo(
    () => [...new Set(drivers.map((d) => d.name).filter(Boolean))],
    [drivers]
  );

  // consistent colors per text
  const toneFromText = (text) => {
    if (!text) return "gray";
    const tones = ["green", "amber", "red", "blue", "indigo", "gray"];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    return tones[hash % tones.length];
  };

  const toneForCondition = (v) => {
    if (!v) return "gray";
    if (v === "READY TO USE") return "green";
    if (v === "FOR REPAIR") return "amber";
    if (v === "FOR DISPOSAL") return "red";
    if (v === "Insurance Registration") return "blue";
    return "gray";
  };

  const toneForAvailability = (v) => {
    if (!v) return "gray";
    if (v === "Available") return "emerald";
    if (v === "Unavailable") return "rose";
    if (v === "Repair") return "orange";
    if (v === "Cancelled") return "slate";
    return "gray";
  };

  // PATCH only what changed
  const patchTrip = async (id, patch) => {
    const payload = { ...patch };

    ["date_requested", "time_of_travel", "time_returned"].forEach((f) => {
      if (payload[f] === "") payload[f] = null;
    });

    const res = await fetch(`http://127.0.0.1:8000/api/trips/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      console.error("PATCH error payload:", payload);
      console.error("PATCH error response:", data);
      throw new Error("PATCH failed");
    }

    return data;
  };

  // IMPORTANT: functional setTrips so the right row changes every time
  const handleChange = (index, field, value) => {
    setTrips((prev) => {
      const original = prev[index];
      if (!original) return prev;

      const next = { ...original, [field]: value };
      const updated = [...prev];
      updated[index] = next;

      patchTrip(original.id, { [field]: value })
        .then((serverTrip) => {
          if (!serverTrip) return;
          setTrips((curr) => curr.map((t) => (t.id === serverTrip.id ? serverTrip : t)));
        })
        .catch((err) => {
          console.error("PATCH failed:", err);
          setTrips((curr) => {
            const copy = [...curr];
            const idx = copy.findIndex((t) => t.id === original.id);
            if (idx !== -1) copy[idx] = original;
            return copy;
          });
        });

      return updated;
    });
  };

  const addRow = () => {
    const newTrip = {
      vehicle_name: "",
      condition: "",
      driver: "",
      availability: "",
      destination: "",
      date_requested: null,
      requester: "",
      remarks: "",
      passengers: 0,
      time_of_travel: null,
      time_returned: null,
      date_of_trip: date,
    };

    fetch("http://127.0.0.1:8000/api/trips/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip),
    })
      .then((res) => res.json())
      .then((data) => setTrips((prev) => [...prev, data]));
  };

  const deleteTrip = (id) => {
    if (!window.confirm("Delete this trip?")) return;
    fetch(`http://127.0.0.1:8000/api/trips/${id}/`, { method: "DELETE" }).then(() =>
      setTrips((prev) => prev.filter((t) => t.id !== id))
    );
  };

  // Global table filter
  const filteredTrips = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return trips;

    return trips.filter((t) => {
      const blob = [
        t.vehicle_name,
        t.condition,
        t.driver,
        t.availability,
        t.destination,
        t.requester,
        t.remarks,
        String(t.passengers ?? ""),
        String(t.date_requested ?? ""),
        String(t.time_of_travel ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [trips, tableQuery]);

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

        <div className="table-card__inner">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Condition</th>
                <th>Driver</th>
                <th>Availability</th>
                <th>Destination</th>
                <th>Time of Travel</th>
                <th>Requester</th>
                <th>Remarks</th>
                <th>Pax</th>
                <th>Date Req.</th>
                <th className="th-actions">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-cell">
                    No trips found
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  // map back to original index for PATCH handling
                  const i = trips.findIndex((t) => t.id === trip.id);

                  return (
                    <tr key={trip.id}>
                      <td className="col-tight">
                        <InlinePicker
                          value={trip.vehicle_name || ""}
                          placeholder="Vehicle"
                          options={vehicleOptions}
                          getTone={toneFromText}
                          onSelect={(v) => handleChange(i, "vehicle_name", v)}
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.condition || ""}
                          placeholder="Condition"
                          options={conditions}
                          getTone={toneForCondition}
                          onSelect={(v) => handleChange(i, "condition", v)}
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.driver || ""}
                          placeholder="Driver"
                          options={driverOptions}
                          getTone={toneFromText}
                          onSelect={(v) => handleChange(i, "driver", v)}
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.availability || ""}
                          placeholder="Availability"
                          options={availabilities}
                          getTone={toneForAvailability}
                          onSelect={(v) => handleChange(i, "availability", v)}
                        />
                      </td>

                      <td className="col-wide">
                        <input
                          className="cell-input"
                          value={trip.destination || ""}
                          onChange={(e) => handleChange(i, "destination", e.target.value)}
                          placeholder="Destination…"
                        />
                      </td>

                      <td className="col-time">
                        <input
                          type="time"
                          className="cell-input"
                          value={toTimeInput(trip.time_of_travel)}
                          onChange={(e) =>
                            handleChange(i, "time_of_travel", fromTimeInput(e.target.value))
                          }
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.requester || ""}
                          placeholder="Requester"
                          options={requesters}
                          getTone={toneFromText}
                          onSelect={(v) => handleChange(i, "requester", v)}
                        />
                      </td>

                      <td className="col-wide">
                        <input
                          className="cell-input"
                          value={trip.remarks || ""}
                          onChange={(e) => handleChange(i, "remarks", e.target.value)}
                          placeholder="Remarks…"
                        />
                      </td>

                      <td className="col-num">
                        <input
                          type="number"
                          min="0"
                          className="cell-input cell-input--num"
                          value={trip.passengers ?? 0}
                          onChange={(e) =>
                            handleChange(i, "passengers", parseInt(e.target.value) || 0)
                          }
                        />
                      </td>

                      <td className="col-date">
                        <input
                          type="date"
                          className="cell-input"
                          value={trip.date_requested || ""}
                          onChange={(e) => handleChange(i, "date_requested", e.target.value || null)}
                        />
                      </td>

                      <td className="td-actions">
                        <button className="btn-danger-ghost" onClick={() => deleteTrip(trip.id)}>
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
      </div>
    </div>
  );
}

export default Trip;