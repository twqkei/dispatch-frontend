import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { apiFetch } from "./api";


// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-10 h-14 flex items-center justify-between shrink-0 z-10">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">Motor Pool Services Unit</p>
          <p className="text-[10px] text-slate-400 hidden sm:block">Davao del Norte State College</p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Submit Request → navigates to /status page */}
        <Link
          to="/request"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Submit Request</span>
          <span className="sm:hidden">Submit</span>
        </Link>

        {/* Admin Login */}
        <a
          href="/login"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin Login</span>
          <span className="sm:hidden">Login</span>
        </a>
      </div>
    </header>
  );
}

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveTokens = ({ access, refresh }) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch("/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }, { auth: false });

      setIsLoading(false);

      if (!data?.access || !data?.refresh) {
        setError("Login failed: tokens not returned.");
        return;
      }

      saveTokens({ access: data.access, refresh: data.refresh });
      navigate("/home");
    } catch (err) {
      setIsLoading(false);
      console.error("Login error:", err);
      setError(err.message || "Network/server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="welcome-text">
          <h2>Welcome back!</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="input-field"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="input-field"
          />

          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? "Logging in..." : "Log In"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>
        
      </div>
    </div>
  );
};

export default Login;