import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import API_BASE from "./api";

function Home() {
  const [tripData, setTripData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = () => {
    fetch(`${API_BASE}/login/`)
      .then(setTripData)
  };

  const handleDateClick = (selectedDate) => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    navigate(`/trips/${y}-${m}-${d}`);
  };

  const getTripsForDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    return tripData.filter((t) => t.date_of_trip === formatted);
  };

  return (
    <div style={{ padding: 10 }}>
      <Calendar
        onClickDay={handleDateClick}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const trips = getTripsForDate(date);

            if (trips.length > 0) {
              return (
                <div className="vehicle-dots">
                  {trips.map((trip) => (
                    <span
                      key={trip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={`vehicle-dot ${
                        trip.availability === "Cancelled" ? "cancelled-trip" : ""
                      }`}
                    >
                      {trip.vehicle_name || trip.vehicle?.model}
                    </span>
                  ))}
                </div>
              );
            }
          }
          return null;
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return null;

          const trips = getTripsForDate(date);
          if (trips.length === 0) return null;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);

          if (checkDate < today) return "trip-past";
          if (checkDate > today) return "trip-future";
          return "trip-today";
        }}
      />
    </div>
  );
}

export default Home;