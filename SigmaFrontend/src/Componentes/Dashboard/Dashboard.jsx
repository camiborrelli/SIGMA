import React from "react";
import ListadoGeneral from "../Maquinaria/ListadoGeneral";
import ListadoUsuarios from "../Usuario/ListadoUsuarios";
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

  const registrarMaquinaria = () => {
    Navigate("/registrarMaquinaria");
  };

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    usuario = null;
  }
  const rol = usuario ? usuario.rol : null;

  return (
    <div className="container">
      <div className="container-inicio">
        <div className="inicio-texto">
          <h1 className="titulo-principal">Gestion de equipos</h1>
          <p>Administra maquinas y herramientas de la empresa Transamerican</p>
        </div>
        {rol === "Admin" && (
          <div className="inicio-acciones">
            <button className="btn btn-acciones">Registro de acciones</button>
            <button className="btn btn-register" onClick={registrarMaquinaria}>
              + Nuevo Equipo
            </button>
          </div>
        )}
      </div>

      <div className="card dashboard-card">
        <ListadoGeneral />
      </div>

      {rol === "Admin" && (
        <div className="card dashboard-card">
          <h1 className="titulo-principal">Gestión de usuarios</h1>
          <ListadoUsuarios />
        </div>
      )}

      <button onClick={logout}>Cerrar sesion</button>
    </div>
  );
};

export default Dashboard;
