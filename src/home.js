import { useEffect, useMemo, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import CalendarComponent from "./calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { apiFetch } from "./api";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const loadTrips = useCallback(async () => {
    try {
      const data = await apiFetch("/trips/");
      setTripData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load trips:", error);
      setTripData([]);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const getTripsForDate = useCallback(
    (date) => tripData.filter((t) => t.date_of_trip === toISO(date)),
    [tripData]
  );

  const tripsForDay = useMemo(() => {
    return [...getTripsForDate(selectedDate)].sort((a, b) => {
      const aTime = a.time_of_travel || "99:99:99";
      const bTime = b.time_of_travel || "99:99:99";
      return aTime.localeCompare(bTime);
    });
  }, [getTripsForDate, selectedDate]);

  const groupedTrips = useMemo(() => {
    return {
      UPCOMING: tripsForDay.filter((t) => t.status === "UPCOMING"),
      ONGOING: tripsForDay.filter((t) => t.status === "ONGOING"),
      COMPLETED: tripsForDay.filter((t) => t.status === "COMPLETED"),
      CANCELLED: tripsForDay.filter((t) => t.status === "CANCELLED"),
    };
  }, [tripsForDay]);

  const nextTrip = useMemo(() => {
    const activeTrips = tripsForDay.filter((t) => t.status !== "CANCELLED");
    return activeTrips[0] || tripsForDay[0] || null;
  }, [tripsForDay]);

  const summaryItems = useMemo(
    () => [
      {label: "Total", value: tripsForDay.length},
      {label: "Upcoming", value: groupedTrips.UPCOMING.length},
      {label: "Ongoing", value: groupedTrips.ONGOING.length},
      {label: "Cancelled", value: groupedTrips.CANCELLED.length},
    ],
    [tripsForDay, groupedTrips]
  )

  const onClickDay = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    navigate(`/trips/${y}-${m}-${d}`);
  };

  const handleStatusChange = async (tripId, newStatus) => {
    const previousTripData = tripData;

    setTripData((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, status: newStatus, manual_status: true } : t
      )
    );

    try {
      await apiFetch(`/trips/${tripId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          manual_status: true,
        }),
      });

      await loadTrips();
    } catch (error) {
      console.error("Failed to update trip status:", error);
      setTripData(previousTripData);
    }
  };

  const today = useMemo(() => startOfDay(new Date()), []);
  const tabs = useMemo(
    () => [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)],
    [selectedDate]
  );

  return (
    <div className="dash">
      <div className="dashTop">
        <div className="dashBrand">
          <div className="dashLogo" />
        </div>

        <div className="dashDateNav">
          <button
            className="iconBtn"
            onClick={() => setSelectedDate((d) => startOfDay(addDays(d, -1)))}
          >
            ‹
          </button>

          <div className="dashTabs">
            {tabs.map((d) => (
              <button
                key={toISO(d)}
                className={`dashTab ${sameDay(d, selectedDate) ? "active" : ""}`}
                onClick={() => setSelectedDate(startOfDay(d))}
              >
                {sameDay(d, today)
                  ? "Today"
                  : d.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
              </button>
            ))}
          </div>

          <button
            className="iconBtn"
            onClick={() => setSelectedDate((d) => startOfDay(addDays(d, 1)))}
          >
            ›
          </button>
        </div>

        <div className="dashMeta">
          <div className="dashHeaderDate">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="dashGrid">
        <div className="dashLeft">
          {Object.entries(groupedTrips).map(([section, trips]) => (
            <Column
              key={section}
              title={`${section} (${trips.length})`}
              items={trips}
              renderItem={(t) => (
                <TaskCard trip={t} onStatusChange={handleStatusChange} />
              )}
            />
          ))}
        </div>

       <div className="dashRight">
  <div className="colBody calendarColBody">
    <CalendarComponent
      value={selectedDate}
      onDateClick={onClickDay}
      getTripsForDate={getTripsForDate}
    />
  </div>

  <div className="rightPanel">
    <div className="infoCard">
      <div className="infoCardTitle">Overview</div>
      <div className="summaryRow">
  {summaryItems.map((item) => (
    <span
      key={item.label}
      className={`summaryBadge summary-${item.label.toLowerCase()}`}
    >
      {item.label}: {item.value}
    </span>
  ))}
</div>
    </div>

    <div className="infoCard">
      <div className="infoCardTitle">Next Trip</div>
      {nextTrip ? (
        <div className="nextTripCard">
          <div className="nextTripVehicle">
            {nextTrip.vehicle_name || "No vehicle"}
          </div>
          <div className="nextTripMeta">
            {nextTrip.driver_name || "No driver"}
            {nextTrip.time_of_travel ? ` | ${nextTrip.time_of_travel}` : ""}
            {nextTrip.destination ? ` | ${nextTrip.destination}` : ""}
          </div>
          <div className={`miniStatus miniStatus-${(nextTrip.status || "UPCOMING").toLowerCase()}`}>
            {nextTrip.status || "UPCOMING"}
          </div>
        </div>
      ) : (
        <div className="empty">No trips for this date.</div>
      )}
    </div>

  </div>
</div>
      </div>
    </div>
  );
}

function Column({ title, items, renderItem }) {
  return (
    <div className="col">
      <div className="colHead">
        <div className="colTitle">{title}</div>
      </div>

      <div className="colBody tripColBody">
        {items.length ? (
          items.map((t) => <div key={t.id || JSON.stringify(t)}>{renderItem(t)}</div>)
        ) : (
          <div className="empty">No {title.toLowerCase()}.</div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ trip, onStatusChange }) {
  const statusColors = {
    ONGOING: { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
    UPCOMING: { bg: "#fff8e1", color: "#d97706", dot: "#f59e0b" },
    COMPLETED: { bg: "#e5e7eb", color: "#6b7280", dot: "#9ca3af" },
    CANCELLED: { bg: "#fff3f3", color: "#dc2626", dot: "#ef4444" },
  };

  const statusOptions = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

  const status = trip.status || "UPCOMING";
  const { bg, color, dot } = statusColors[status] || statusColors.UPCOMING;

  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  const handleRightClick = (e) => {
    e.preventDefault();
    setMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeMenu = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!menu.visible) return;

    const handleWindowClick = () => closeMenu();
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const handleScroll = () => closeMenu();

    window.addEventListener("click", handleWindowClick);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [menu.visible, closeMenu]);

  return (
    <>
      <div className="card tripCard" onContextMenu={handleRightClick}>
        <div className="tripCardTop">
          <div className="tripCardMain">
            <div className="tripVehicle">{trip.vehicle_name || "No vehicle"}</div>
            <div className="tripMeta">
              {trip.driver_name || "No driver"}
              {trip.time_of_travel ? ` | ${trip.time_of_travel}` : ""}
              {trip.destination ? ` | ${trip.destination}` : ""}
            </div>
          </div>

          <div
            className="tripStatusBadge"
            style={{ background: bg, color }}
          >
            <span
              className="tripStatusDot"
              style={{ background: dot }}
            />
            {status}
          </div>
        </div>
      </div>

      {menu.visible && (
        <div
          className="statusMenu"
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="statusMenuHead">Status</div>

          {statusOptions.map((option) => {
            const opt = statusColors[option] || statusColors.UPCOMING;
            const isCurrent = option === status;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onStatusChange(trip.id, option);
                  closeMenu();
                }}
                className={`statusMenuItem ${isCurrent ? "current" : ""}`}
              >
                <span
                  className="statusMenuBadge"
                  style={{
                    background: opt.bg,
                    color: opt.color,
                  }}
                >
                  <span
                    className="statusMenuDot"
                    style={{ background: opt.dot }}
                  />
                  {option}
                </span>

                {isCurrent && <span className="statusMenuCurrent">Current</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}