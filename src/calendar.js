import Calendar from "react-calendar"; 
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

export default function CalendarComponent({ value, onDateClick, getTripsForDate }) {
  return (
    <Calendar
      value={value}
      onClickDay={onDateClick}
      tileContent={({ date, view }) => {
        if (view !== "month") return null;

        const trips = getTripsForDate(date);
        if (!trips || trips.length === 0) return null;

        const hasActive = trips.some((t) => t.availability !== "Cancelled");
        const hasCancelled = trips.some((t) => t.availability === "Cancelled");

        return (
          <div className="tripDotWrap">
            {hasActive && <span classname="tripDot active" />}
            {hasCancelled && <span classname="tripDot cancelled" />}
          </div>
        );
      }}
      tileClassName={({ date, view }) => {
        if (view !== "month") return null;

        const trips = getTripsForDate(date);
        if (!trips || trips.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < today) return "trip-past";
        if (checkDate > today) return "trip-future";
        return "trip-today";
      }}
    />
  );
}