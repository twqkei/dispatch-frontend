import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./home";
import Logs from "./logs";
import Drivers from "./drivers";
import Status from "./requeststatus";
import Trips from "./trip";
import "./App.css";
import Login from "./login";
import Logout from "./logout";

function App() {
  const location = useLocation();

  // Hide topbar on login page
  const hideTopbar = location.pathname === "/";

  return (
    <div className="app-container">

      {/* Top bar */}
      {!hideTopbar && (
        <header className="topbar">
          <div className="brand">
            Vehicle Dispatch | 2026
          </div>

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
              to="/status"
              className={({ isActive }) =>
                `pill ${isActive ? "active status" : ""}`
              }
            >
              Request Status
            </NavLink>

          </nav>

          <Logout />
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
          <Route path="/status" element={<Status />} />
          <Route path="/trips/:date" element={<Trips />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;