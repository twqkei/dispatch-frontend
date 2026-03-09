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

  const statuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];
  const requesters = [
    "IAAS","IADS","ILEGG","IC","ITED","OSDS","Cashier","REP","HRMO","PSU","Supply",
    "PRMO","QA","PIO","Record Management Office", "BASD","VPAA","VPAF","VPREP","Extension Division",
    "Research Development Division","Production Division","Carmen Campus","TBI","Engineering Office",
    "GAD","Internalization","Office of the President","Quality Assurance","GASSO","Faculty Association",
    "Admin Services","Registrar","Accounting Office","GSU","Other Agency","OP","Budget","BOARD SEC","External Visitors",
    "Samal Campus", "BAC"
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/trips/by_date/?date=${encodeURIComponent(date)}`, {
          method: "GET",
        });
        setTrips(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Fetch trips by date error:", e);
        setTrips([]);
      }
    })();
  }, [date]);

  useEffect(() => {
    (async () => {
      try {
        const d = await apiFetch("/drivers/");
        setDrivers(Array.isArray(d) ? d : []);
      } catch (e) {
        console.error("Fetch drivers error:", e);
        setDrivers([]);
      }

      try {
        const v = await apiFetch("/vehicles/");
        setVehicles(Array.isArray(v) ? v : []);
      } catch (e) {
        console.error("Fetch vehicles error:", e);
        setVehicles([]);
      }
    })();
  }, []);

  const toneFromText = (text) => {
    if (!text) return "gray";
    const tones = ["green", "amber", "red", "blue", "indigo", "gray"];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    return tones[hash % tones.length];
  };

  const toneForStatus = (v) => {
    if (!v) return "gray";
    if (v === "UPCOMING") return "amber";
    if (v === "ONGOING") return "green";
    if (v === "COMPLETED") return "slate";
    if (v === "CANCELLED") return "rose";
    return "gray";
  };

  const activeTrips = useMemo(() => {
    return trips.filter((t) => ["UPCOMING", "ONGOING"].includes(t.status));
  }, [trips]);

  const baseAssignableVehicles = useMemo(() => {
    return vehicles.filter(
      (v) =>
        v.condition === "READY_TO_USE" &&
        v.availability !== "UNAVAILABLE" &&
        v.computed_status === "AVAILABLE"
    );
  }, [vehicles]);

  const patchTrip = async (id, patch) => {
    const payload = { ...patch };
    ["date_requested", "time_of_travel"].forEach((f) => {
      if (payload[f] === "") payload[f] = null;
    });
    return apiFetch(`/trips/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

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

  const handleDriverSelect = (index, name) => {
    const selectedDriver = drivers.find((d) => d.name === name);
    if (!selectedDriver) return;
    handleChange(index, "driver", selectedDriver.id);
  };

  const handleVehicleSelect = (index, displayValue, optionsForRow) => {
    const selectedVehicle = optionsForRow.find(
      (v) => `${v.plate_number} | ${v.model}` === displayValue
    );
    if (!selectedVehicle) return;
    handleChange(index, "vehicle", selectedVehicle.id);
  };

  const addRow = () => {
    const newTrip = {
      vehicle: null,
      driver: null,
      status: "UPCOMING",
      destination: "",
      date_requested: null,
      requester: "",
      remarks: "",
      passengers: 0,
      time_of_travel: null,
      date_of_trip: date,
    };

    apiFetch("/trips/", {
      method: "POST",
      body: JSON.stringify(newTrip),
    })
      .then((data) => setTrips((prev) => [...prev, data]))
      .catch((e) => console.error("Add trip error:", e));
  };

  const deleteTrip = (id) => {
    if (!window.confirm("Delete this trip?")) return;
    apiFetch(`/trips/${id}/`, { method: "DELETE" })
      .then(() => setTrips((prev) => prev.filter((t) => t.id !== id)))
      .catch((e) => console.error("Delete trip error:", e));
  };

  const filteredTrips = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) => {
      const blob = [
        t.vehicle_name,
        t.driver_name,
        t.status,
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

  const getAvailableVehiclesForRow = (rowTrip) => {
    const usedVehicleIds = new Set(
      activeTrips
        .filter((t) => t.id !== rowTrip.id && t.vehicle)
        .map((t) => t.vehicle)
    );

    const currentVehicle =
      rowTrip.vehicle != null
        ? vehicles.find((v) => v.id === rowTrip.vehicle)
        : null;

    const allowed = baseAssignableVehicles.filter((v) => !usedVehicleIds.has(v.id));

    if (
      currentVehicle &&
      !allowed.some((v) => v.id === currentVehicle.id)
    ) {
      return [currentVehicle, ...allowed];
    }

    return allowed;
  };

  const getAvailableDriversForRow = (rowTrip) => {
    const usedDriverIds = new Set(
      activeTrips
        .filter((t) => t.id !== rowTrip.id && t.driver)
        .map((t) => t.driver)
    );

    const currentDriver =
      rowTrip.driver != null
        ? drivers.find((d) => d.id === rowTrip.driver)
        : null;

    const allowed = drivers.filter((d) => !usedDriverIds.has(d.id));

    if (
      currentDriver &&
      !allowed.some((d) => d.id === currentDriver.id)
    ) {
      return [currentDriver, ...allowed];
    }

    return allowed;
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
                <th>Driver</th>
                <th>Status</th>
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
                  <td colSpan="10" className="empty-cell">
                    No trips found
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const i = trips.findIndex((t) => t.id === trip.id);

                  const availableVehiclesForRow = getAvailableVehiclesForRow(trip);
                  const vehicleOptions = availableVehiclesForRow.map(
                    (v) => `${v.plate_number} | ${v.model}`
                  );

                  const availableDriversForRow = getAvailableDriversForRow(trip);
                  const driverOptions = availableDriversForRow.map((d) => d.name);

                  const currentVehicleDisplay =
                    trip.plate_number && trip.vehicle_name
                      ? `${trip.plate_number} | ${trip.vehicle_name}`
                      : trip.vehicle_name || "";

                  return (
                    <tr key={trip.id}>
                      <td className="col-tight">
                        <InlinePicker
                          value={currentVehicleDisplay}
                          placeholder="Vehicle"
                          options={vehicleOptions}
                          getTone={toneFromText}
                          onSelect={(v) => handleVehicleSelect(i, v, availableVehiclesForRow)}
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.driver_name || ""}
                          placeholder="Driver"
                          options={driverOptions}
                          getTone={toneFromText}
                          onSelect={(v) => handleDriverSelect(i, v)}
                        />
                      </td>

                      <td className="col-tight">
                        <InlinePicker
                          value={trip.status || ""}
                          placeholder="Status"
                          options={statuses}
                          getTone={toneForStatus}
                          onSelect={(v) => handleChange(i, "status", v)}
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
                            handleChange(i, "passengers", parseInt(e.target.value, 10) || 0)
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