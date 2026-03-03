// src/logout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    navigate("/"); // redirect to login
  };

  return (
    <div className="logout" onClick={handleLogout} style={{ cursor: "pointer" }}>
      <img
        src="/logout.png"
        alt="Logout"
        style={{ width: "30px", height: "30px" }}
      />
    </div>
  );
};

export default Logout;