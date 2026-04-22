import React from "react";
import ListadoGeneral from "../Maquinaria/ListadoGeneral";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const Navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
    Navigate("/");
  };
  return (
    <div className="container">
      <div className="card dashboard-card">
        <ListadoGeneral />
      </div>

      <button onClick={logout}>Cerrar sesion</button>
    </div>
  );
};

export default Dashboard;
