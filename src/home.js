import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CalendarComponent from "./calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { apiFetch } from "./api";

function startOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const STATUS_ORDER = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

const STATUS_COLORS = {
  ONGOING: { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  UPCOMING: { bg: "#fff8e1", color: "#d97706", dot: "#f59e0b" },
  COMPLETED: { bg: "#e5e7eb", color: "#6b7280", dot: "#9ca3af" },
  CANCELLED: { bg: "#fff3f3", color: "#dc2626", dot: "#ef4444" },
};

export default function Home() {
  const navigate = useNavigate();

  const [tripData, setTripData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date())
  );

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
    (date) => tripData.filter((trip) => trip.date_of_trip === toISO(date)),
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
      UPCOMING: tripsForDay.filter((trip) => trip.status === "UPCOMING"),
      ONGOING: tripsForDay.filter((trip) => trip.status === "ONGOING"),
      COMPLETED: tripsForDay.filter((trip) => trip.status === "COMPLETED"),
      CANCELLED: tripsForDay.filter((trip) => trip.status === "CANCELLED"),
    };
  }, [tripsForDay]);

  const summaryItems = useMemo(
    () => [
      { label: "Total", value: tripsForDay.length },
      { label: "Upcoming", value: groupedTrips.UPCOMING.length },
      { label: "Ongoing", value: groupedTrips.ONGOING.length },
      { label: "Cancelled", value: groupedTrips.CANCELLED.length },
    ],
    [tripsForDay, groupedTrips]
  );

  const hasTrips = tripsForDay.length > 0;

  const today = useMemo(() => startOfDay(new Date()), []);
  const tabs = useMemo(
    () => [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)],
    [selectedDate]
  );

  const handleDayClick = useCallback(
    (date) => {
      navigate(`/trips/${toISO(date)}`);
    },
    [navigate]
  );

  const handleStatusChange = async (tripId, newStatus) => {
    const previousTripData = tripData;

    setTripData((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === tripId
          ? { ...trip, status: newStatus, manual_status: true }
          : trip
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

  return (
    <div className="dash">
      <div className="dashTop">
        <div className="dashBrand">
          <div className="dashLogo" />
        </div>

        <div className="dashDateNav">
          <button
            className="iconBtn"
            onClick={() =>
              setSelectedDate((currentDate) =>
                startOfDay(addDays(currentDate, -1))
              )
            }
          >
            ‹
          </button>

          <div className="dashTabs">
            {tabs.map((date) => (
              <button
                key={toISO(date)}
                className={`dashTab ${
                  sameDay(date, selectedDate) ? "active" : ""
                }`}
                onClick={() => setSelectedDate(startOfDay(date))}
              >
                {sameDay(date, today)
                  ? "Today"
                  : date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
              </button>
            ))}
          </div>

          <button
            className="iconBtn"
            onClick={() =>
              setSelectedDate((currentDate) =>
                startOfDay(addDays(currentDate, 1))
              )
            }
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
          {hasTrips ? (
            Object.entries(groupedTrips)
              .filter(([_, trips]) => trips.length > 0)
              .map(([section, trips]) => (
                <Column
                  key={section}
                  title={`${
                    section.charAt(0) + section.slice(1).toLowerCase()
                  } (${trips.length})`}
                  items={trips}
                  renderItem={(trip) => (
                    <TaskCard
                      trip={trip}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                />
              ))
          ) : (
            <div className="emptyState">
              <p>No trips for this day</p>
              <button
                className="primaryBtn"
                onClick={() => navigate("/create-trip")}
              >
                Create Trip
              </button>
            </div>
          )}
        </div>

        <div className="dashRight">
          <div className="colBody calendarColBody">
            <CalendarComponent
              value={selectedDate}
              onDateClick={handleDayClick}
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
        {items.map((item) => (
          <div key={item.id || JSON.stringify(item)}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ trip, onStatusChange }) {
  const status = trip.status || "UPCOMING";
  const { bg, color, dot } =
    STATUS_COLORS[status] || STATUS_COLORS.UPCOMING;

  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  const handleRightClick = (event) => {
    event.preventDefault();
    setMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const closeMenu = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!menu.visible) return;

    const handleClick = () => closeMenu();
    const handleEscape = (e) => e.key === "Escape" && closeMenu();

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menu.visible, closeMenu]);

  return (
    <>
      <div className="card tripCard" onContextMenu={handleRightClick}>
        <div className="tripCardTop">
          <div className="tripCardMain">
            <div className="tripVehicle">
              {trip.vehicle_name || "No vehicle"}
            </div>
            <div className="tripMeta">
              {trip.driver_name || "No driver"}
              {trip.time_of_travel ? ` | ${trip.time_of_travel}` : ""}
              {trip.destination ? ` | ${trip.destination}` : ""}
            </div>
          </div>

          <div className="tripStatusBadge" style={{ background: bg, color }}>
            <span className="tripStatusDot" style={{ background: dot }} />
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

          {STATUS_ORDER.map((option) => {
            const optionColors =
              STATUS_COLORS[option] || STATUS_COLORS.UPCOMING;

            return (
              <button
                key={option}
                className="statusMenuItem"
                onClick={() => {
                  onStatusChange(trip.id, option);
                  closeMenu();
                }}
              >
                <span
                  className="statusMenuBadge"
                  style={{
                    background: optionColors.bg,
                    color: optionColors.color,
                  }}
                >
                  <span
                    className="statusMenuDot"
                    style={{ background: optionColors.dot }}
                  />
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