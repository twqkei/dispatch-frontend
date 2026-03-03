import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
const API_BASE = "https://weircheve.pythonanywhere.com/dispatch";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveTokens = ({ access, refresh }) => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
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
      const response = await fetch(`${API_BASE}/dispatch/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setError(data?.detail || "Login failed.");
        return;
      }

      if (!data?.access || !data?.refresh) {
        setError("Login failed: tokens not returned.");
        return;
      }

      saveTokens({ access: data.access, refresh: data.refresh });
      navigate("/home");

    } catch (err) {
      setIsLoading(false);
      console.error("Login error:", err);
      setError("Network/server error. Please try again.");
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

      <button
        type="submit"
        disabled={isLoading}
        className="login-btn"
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </form>
  </div>
</div>
);
};

export default Login;