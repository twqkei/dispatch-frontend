import { useEffect, useMemo, useState } from "react";
import "./logs.css";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function Logs() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [allTrips, setAllTrips] = useState([]);
  const [monthFilter, setMonthFilter] = useState({
    search: "",
    driver: "",
    vehicle: ""
  });
  const [selectedWeek, setSelectedWeek] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/trips/")
      .then(res => res.json())
      .then(data => setAllTrips(data));
  }, []);

  const matchesSearch = (t, q) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (t.destination || "").toLowerCase().includes(s) ||
      (t.driver || "").toLowerCase().includes(s) ||
      (t.vehicle_name || "").toLowerCase().includes(s) ||
      (t.requester || "").toLowerCase().includes(s) ||
      (t.remarks || "").toLowerCase().includes(s)
    );
  };

  const monthTrips = useMemo(() => {
    return allTrips
      .filter(t => {
        if (!t.date_of_trip) return false;
        const d = new Date(t.date_of_trip);

        return (
          d.getMonth() === selectedMonth &&
          matchesSearch(t, monthFilter.search) &&
          (!monthFilter.driver || t.driver === monthFilter.driver) &&
          (!monthFilter.vehicle || t.vehicle_name === monthFilter.vehicle)
        );
      })
      .sort((a, b) => new Date(b.date_of_trip) - new Date(a.date_of_trip));
  }, [allTrips, selectedMonth, monthFilter]);

  // ✅ Overall monthly total
  const monthlyTotalTrips = monthTrips.length;

  const grouped = useMemo(() => {
    const g = {};
    monthTrips.forEach(t => {
      const day = new Date(t.date_of_trip).getDate();
      const week = Math.ceil(day / 7);
      if (!g[week]) g[week] = [];
      g[week].push(t);
    });
    return g;
  }, [monthTrips]);

  const weekKeys = useMemo(
  () => Object.keys(grouped).map(Number).sort((a,b)=>b-a),
  [grouped]
  );

  const tableTrips = useMemo(() => {
    if (selectedWeek == null) return monthTrips;
    return grouped[selectedWeek] || [];
  }, [selectedWeek, monthTrips, grouped]);

  const tableTotalTrips = tableTrips.length;

  const printTable = () => window.print();

  const monthDrivers = useMemo(
    () => [...new Set(monthTrips.map(t => t.driver).filter(Boolean))].sort(),
    [monthTrips]
  );

  const monthVehicles = useMemo(
    () => [...new Set(monthTrips.map(t => t.vehicle_name).filter(Boolean))].sort(),
    [monthTrips]
  );

  return (
    <div className="logs-container">
      <div className="month-tabs">
        {months.map((m,i)=>(
          <button
            key={i}
            className={selectedMonth===i ? "active" : ""}
            onClick={()=>{
              setSelectedMonth(i);
              setSelectedWeek(null);
            }}
          >
            {m.slice(0,3)}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="logs-headrow">
        <div className="logs-title">
          {months[selectedMonth]}{" "}
          <span className="logs-title-muted">
            | {selectedWeek ? `Week ${selectedWeek}` : "Logs"}
          </span>
        </div>
      </div>

      {/* Week Tabs */}
      <div className="folder-tabs no-print">
        <button
          className={`folder-tab ${selectedWeek==null ? "is-active" : ""}`}
          onClick={()=>setSelectedWeek(null)}
        >
          All
        </button>

        {weekKeys.map(week => (
          <button
            key={week}
            className={`folder-tab ${selectedWeek===week ? "is-active" : ""}`}
            onClick={()=>setSelectedWeek(week)}
          >
            Week {week}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar-card no-print">
        <div className="toolbar-left">
          <div className="control">
            <label>Vehicle</label>
            <select
              value={monthFilter.vehicle}
              onChange={e=>setMonthFilter(p=>({...p,vehicle:e.target.value}))}
            >
              <option value="">All</option>
              {monthVehicles.map(v=><option key={v}>{v}</option>)}
            </select>
          </div>

          <div className="control">
            <label>Driver</label>
            <select
              value={monthFilter.driver}
              onChange={e=>setMonthFilter(p=>({...p,driver:e.target.value}))}
            >
              <option value="">All</option>
              {monthDrivers.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="control control-search">
            <label>Search</label>
            <input
              placeholder="Destination, requester, remarks..."
              value={monthFilter.search}
              onChange={(e) => {
                setMonthFilter(p => ({ ...p, search: e.target.value }));
              }}
            />
          </div>
        </div>

        <div className="toolbar-right">
          <div className="totals-chip totals-chip--toolbar">
            Total: <b>{tableTotalTrips}</b>
          </div>

          <button className="btn btn-print" onClick={printTable}>
            🖨 Print
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="single-table-wrap">
        {selectedWeek==null ? (
          <>
            {weekKeys.map(week=>(
              <div key={week} className="print-week-section">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Destination</th>
                      <th>Time</th>
                      <th>Passengers</th>
                      <th>Requester</th>
                      <th>Remarks</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(grouped[week] || []).map((trip,i)=>(
                      <tr key={trip.id}>
                        <td>{i+1}</td>
                        <td>{trip.vehicle_name}</td>
                        <td>{trip.driver}</td>
                        <td>{trip.destination}</td>
                        <td>{trip.time_of_travel}</td>
                        <td>{trip.passengers}</td>
                        <td>{trip.requester}</td>
                        <td>{trip.remarks}</td>
                        <td>{trip.date_of_trip}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="table-total-row">
                      <td colSpan="9">
                        Total Trips: <b>{(grouped[week] || []).length}</b>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}

            <div className="monthly-total-footer">
              Overall Monthly Total: <b>{monthlyTotalTrips}</b>
            </div>
          </>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Destination</th>
                  <th>Time</th>
                  <th>Passengers</th>
                  <th>Requester</th>
                  <th>Remarks</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {tableTrips.map((trip,i)=>(
                  <tr key={trip.id}>
                    <td>{i+1}</td>
                    <td>{trip.vehicle_name}</td>
                    <td>{trip.driver}</td>
                    <td>{trip.destination}</td>
                    <td>{trip.time_of_travel}</td>
                    <td>{trip.passengers}</td>
                    <td>{trip.requester}</td>
                    <td>{trip.remarks}</td>
                    <td>{trip.date_of_trip}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="table-total-row">
                  <td colSpan="9">
                    Total Trips: <b>{tableTrips.length}</b>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="monthly-total-footer">
              Overall Monthly Total: <b>{monthlyTotalTrips}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Logs;