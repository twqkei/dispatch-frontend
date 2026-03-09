import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import "./external.css";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const loadData = async () => {
    try {
      const [vehicleData, driverData] = await Promise.all([
        apiFetch("/vehicles/"),
        apiFetch("/drivers/")
      ]);

      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
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
          drivers.map((driver) => {
            const status = getStatusClass(driver.computed_status);

            return (
              <div key={driver.id} className="card">
                <div className="cardTop">
                  <div className="cardTitle">{driver.name}</div>
                  <div className={`status ${status}`}>
                    {status.toUpperCase()}
                  </div>
                </div>

                {driver.assigned_vehicle && (
                  <div className="cardMeta">
                    {driver.assigned_vehicle}
                  </div>
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