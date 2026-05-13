import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Home from "./home";
import Logs from "./logs";
import Drivers from "./drivers";
import Status from "./requeststatus";
import Trips from "./trip";
import "./App.css";
import Login from "./login";
import Logout from "./logout";
import RequestStatus from "./requester/status";
import RequestPage from "./requester/request";

function App() {
  const location = useLocation();

  // Hide topbar on login page
const hideTopbar =
  location.pathname === "/" ||
  location.pathname === "/status" ||
  location.pathname === "/login" ||
  location.pathname === "/request" ;


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
              to="/requeststatus"
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
          <Route path="/" element={<RequestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/status" element={<RequestStatus />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/requeststatus" element={<Status />} />
          <Route path="/trips/:date" element={<Trips />} />
          <Route path="/request" element={<RequestPage />} />
        </Routes>
      </main>

    </div>
  );
}

export default App;