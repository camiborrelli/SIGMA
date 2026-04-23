import React, { useState, useEffect } from "react";
import ListadoGeneral from "../Maquinaria/ListadoGeneral";
import ListadoUsuarios from "../Usuario/ListadoUsuarios";
import "./Dashboard.css";
import EquiposAsignados from "../Maquinaria/EquiposAsignados";
import { useNavigate } from "react-router-dom";
import EquiposMantenimiento from "../Maquinaria/EquiposMantenimiento";
import EquiposDadosDeBaja from "../Maquinaria/EquiposDadosDeBaja";

const Dashboard = () => {
  const Navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
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

  const [totalEquipos, setTotalEquipos] = useState(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let mounted = true;
    const calcularCantidadEquipos = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/maquinaria", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) alert(r.error || "Error al obtener maquinaria");
          if (mounted) setTotalEquipos(0);
        } else {
          const data = await res.json();
          if (mounted) setTotalEquipos(data.length || 0);
        }
      } catch (err) {
        if (mounted) alert("Error de conexión");
        if (mounted) setTotalEquipos(0);
      }
    };

    const equiposDisponibles = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const res = await fetch("http://localhost:5001/maquinaria/activas", {
          headers,
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) alert(r.error || "Error al obtener maquinaria");
          if (mounted) setEquiposDisponibles(0);
        } else {
          const data = await res.json();
          if (mounted)
            setEquiposDisponibles(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        if (mounted) alert("Error de conexión");
        if (mounted) setEquiposDisponibles(0);
      }
    };

    calcularCantidadEquipos();
    equiposDisponibles();

    return () => {
      mounted = false;
    };
  }, []);

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

      <div className="summary-grid">
        <div className="summary-card summary-card--total">
          <div className="summary-card__icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7z"
                stroke="#2563eb"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="summary-card__number">{totalEquipos}</p>
            <h4 className="summary-card__label">Total Equipos</h4>
          </div>
        </div>

        <div className="summary-card summary-card--disponibles">
          <div className="summary-card__icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#10b981"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="summary-card__number">{equiposDisponibles}</p>
            <h4 className="summary-card__label">Disponibles</h4>
          </div>
        </div>

        <EquiposAsignados />

        <EquiposMantenimiento />

        <EquiposDadosDeBaja />
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
