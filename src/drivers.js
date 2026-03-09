import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import "./external.css";

export default function Dashboard() {
  const [drivers, setDrivers] = useState([]);

  const loadData = async () => {
    const d = await apiFetch("/drivers/");
    setDrivers(d);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status = "AVAILABLE") => status.toLowerCase();

  return (
    <div className="page">
      <div className="pageHeader">
        <h1>2026 | DRIVERS LOGS</h1>
      </div>

      <div className="grid">
        {drivers.length > 0 ? (
          drivers.map((d) => {
            const status = getStatusClass(d.computed_status);

            return (
              <div key={d.id} className="card">
                <div className="cardTop">
                  <div className="cardTitle">{d.name}</div>
                  <div className={`status ${status}`}>
                    {status.toUpperCase()}
                  </div>
                </div>

                {d.assigned_vehicle && (
                  <div className="cardMeta">{d.assigned_vehicle}</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="emptyState">No drivers found.</div>
        )}
      </div>
    </div>
  );
}