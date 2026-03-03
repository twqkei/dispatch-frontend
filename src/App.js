import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./home";
import Logs from "./logs";
import Drivers from "./drivers";
import Vehicles from "./vehicles";
import Trips from "./trip";
import "./App.css";
import Login from "./login";
import Logout from "./logout"; // at the top of App.jsx


function App() {
  const location = useLocation();

  // Hide topbar on login page
  const hideTopbar = location.pathname === "/";

  return (
    <div className="app-container">

      {/* Top bar (only show if NOT login page) */}
      {!hideTopbar && (
        <header className="topbar">
          <div className="brand"> Vehicle Dispatch | 2026 </div>

          <nav className="pill-nav" aria-label="Primary">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `pill ${isActive ? "active home" : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/logs"
              className={({ isActive }) =>
                `pill ${isActive ? "active logs" : ""}`
              }
            >
              Logs
            </NavLink>

            <NavLink
              to="/drivers"
              className={({ isActive }) =>
                `pill ${isActive ? "active drivers" : ""}`
              }
            >
              Drivers
            </NavLink>

            <NavLink
              to="/vehicles"
              className={({ isActive }) =>
                `pill ${isActive ? "active vehicles" : ""}`
              }
            >
              Vehicles
            </NavLink>
          </nav>
          <Logout/>
        </header>
      )}

      {/* Main content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trips/:date" element={<Trips />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;