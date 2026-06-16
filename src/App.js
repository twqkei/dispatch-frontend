import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
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
import Landing from "./landing";

// ─── Private Route Guard ───────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const location = useLocation();

  const hideTopbar =
    location.pathname === "/" ||
    location.pathname === "/status" ||
    location.pathname === "/login" ||
    location.pathname === "/request";

  return (
    <div className="app-container">

      {/* Top bar */}
      {!hideTopbar && (
        <header className="topbar">
          <div className="brand">
            Vehicle Dispatch | 2026
          </div>

          <nav className="pill-nav" aria-label="Primary">
            <NavLink to="/home" className={({ isActive }) => `pill ${isActive ? "active home" : ""}`}>
              Home
            </NavLink>
            <NavLink to="/logs" className={({ isActive }) => `pill ${isActive ? "active logs" : ""}`}>
              Logs
            </NavLink>
            <NavLink to="/drivers" className={({ isActive }) => `pill ${isActive ? "active drivers" : ""}`}>
              Resources
            </NavLink>
            <NavLink to="/requeststatus" className={({ isActive }) => `pill ${isActive ? "active status" : ""}`}>
              Request Status
            </NavLink>
          </nav>

          <Logout />
        </header>
      )}

      {/* Main content */}
      <main className="main-content">
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/status" element={<RequestStatus />} />
          <Route path="/request" element={<RequestPage />} />

          {/* ── Admin-only routes ── */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
          <Route path="/drivers" element={<PrivateRoute><Drivers /></PrivateRoute>} />
          <Route path="/requeststatus" element={<PrivateRoute><Status /></PrivateRoute>} />
          <Route path="/trips/:date" element={<PrivateRoute><Trips /></PrivateRoute>} />
        </Routes>
      </main>

    </div>
  );
}

export default App;