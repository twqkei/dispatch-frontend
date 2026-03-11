import { useParams } from "react-router-dom";
import "./external.css";

export default function VehicleHistory() {
  const { id } = useParams();

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="historyPage">
      <h2>Vehicle Condition History</h2>

      <table className="conditionTable">
        <thead>
          <tr>
            <th>Day</th>
            {months.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td>{day}</td>

              {months.map((m) => (
                <td key={m} className="cell ready"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}