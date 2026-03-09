import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import "./external.css";

function VehicleCard({ vehicle, onConditionChange }) {
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  const conditionOptions = [
    "READY_TO_USE",
    "FOR_REPAIR",
    "FOR_DISPOSAL",
  ];

  const closeMenu = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!menu.visible) return;

    const handleClick = () => closeMenu();
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleClick, true);
    window.addEventListener("resize", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleClick, true);
      window.removeEventListener("resize", handleClick);
    };
  }, [menu.visible, closeMenu]);

  const handleRightClick = (e) => {
    e.preventDefault();
    setMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const status = (vehicle.computed_status || "AVAILABLE").toLowerCase();

  const formatCondition = (condition) => {
    if (!condition) return "Unknown";
    return condition.replaceAll("_", " ");
  };

  return (
    <>
      <div className="card" onContextMenu={handleRightClick}>
        <div className="cardTop">
          <div className="cardTitle">
            {vehicle.model} <span className="plate">{vehicle.plate_number}</span>
          </div>
          <div className={`status ${status}`}>{status.toUpperCase()}</div>
        </div>

        <div className="cardMeta">
          <div>{vehicle.driver_name || "No driver"}</div>
          {vehicle.assistant_driver_name && (
            <div className="assistant">{vehicle.assistant_driver_name}</div>
          )}
          <div className="condition">
            Condition: {formatCondition(vehicle.condition)}
          </div>
        </div>
      </div>

      {menu.visible && (
        <div
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            padding: "6px 0",
            zIndex: 9999,
            minWidth: "220px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#64748b",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Change vehicle condition
          </div>

          {conditionOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onConditionChange(vehicle.id, option);
                closeMenu();
              }}
              style={{
                width: "100%",
                border: "none",
                background: option === vehicle.condition ? "#f8fafc" : "transparent",
                textAlign: "left",
                padding: "10px 12px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {option.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  const loadVehicles = async () => {
    const data = await apiFetch("/vehicles/");
    const sorted = [...data].sort((a, b) => {
      const order = { available: 1, reserved: 2, unavailable: 3 };
      const statusA = (a.computed_status || "AVAILABLE").toLowerCase();
      const statusB = (b.computed_status || "AVAILABLE").toLowerCase();
      return (order[statusA] || 99) - (order[statusB] || 99);
    });
    setVehicles(sorted);
  };

  useEffect(() => {
    loadVehicles();
    const interval = setInterval(loadVehicles, 5000);
    return () => clearInterval(interval);
  }, []);

  const conditionSummary = useMemo(() => {
    return vehicles.reduce(
      (acc, v) => {
        if (v.condition === "READY_TO_USE") acc.ready += 1;
        else if (v.condition === "FOR_REPAIR") acc.repair += 1;
        else if (v.condition === "FOR_DISPOSAL") acc.disposal += 1;

        acc.total += 1;
        return acc;
      },
      { ready: 0, repair: 0, disposal: 0, total: 0 }
    );
  }, [vehicles]);

  const handleConditionChange = async (vehicleId, newCondition) => {
    const previousVehicles = vehicles;

    const newAvailability =
      newCondition === "FOR_REPAIR" || newCondition === "FOR_DISPOSAL"
        ? "UNAVAILABLE"
        : "AVAILABLE";

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              condition: newCondition,
              availability: newAvailability,
            }
          : v
      )
    );

    try {
      await apiFetch(`/vehicles/${vehicleId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          condition: newCondition,
          availability: newAvailability,
        }),
      });

      loadVehicles();
    } catch (error) {
      console.error("Failed to update vehicle condition:", error);
      setVehicles(previousVehicles);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <h1>2026 NEW VEHICLE ASSIGNMENT</h1>
      </div>

      <div className="summary">
        <div className="summaryCard ready">
          <div className="summaryTitle">Ready to Use</div>
          <div className="summaryValue">{conditionSummary.ready}</div>
        </div>

        <div className="summaryCard repair">
          <div className="summaryTitle">For Repair</div>
          <div className="summaryValue">{conditionSummary.repair}</div>
        </div>

        <div className="summaryCard disposal">
          <div className="summaryTitle">For Disposal</div>
          <div className="summaryValue">{conditionSummary.disposal}</div>
        </div>

        <div className="summaryCard total">
          <div className="summaryTitle">Total Vehicles</div>
          <div className="summaryValue">{conditionSummary.total}</div>
        </div>
      </div>

      <div className="grid">
        {vehicles.length ? (
          vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onConditionChange={handleConditionChange}
            />
          ))
        ) : (
          <div className="emptyState">No vehicles found</div>
        )}
      </div>
    </div>
  );
}