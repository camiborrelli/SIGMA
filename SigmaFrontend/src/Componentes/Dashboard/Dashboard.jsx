import React, { useState, useEffect } from "react";
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
          <h1>Gestion de equipos</h1>
          <p>Administra maquinas y herramientas de la empresa Transamerican</p>
        </div>
        {rol === "admin" && (
          <div className="inicio-acciones">
            <button className="btn btn-acciones">Registro de acciones</button>
            <button className="btn btn-register" onClick={registrarMaquinaria}>
              + Nuevo Equipo
            </button>
          </div>
        )}
      </div>

      <div className="resumen-general">
        <div className="resumen-item resumen-item--total">
          <p>{totalEquipos}</p>
          <h3>Total Equipos</h3>
        </div>
        <div className="resumen-item resumen-item--disponibles">
          <p>{equiposDisponibles}</p>
          <h3>Disponibles</h3>
        </div>
        {/* <div className="resumen-item">
          <p>{equiposAsignados}</p>
          <h3>Asignados</h3>
        </div>
        <div className="resumen-item">
          <p>{equiposMantenimiento}</p>
          <h3>Mantenimiento</h3>
        </div>
        <div className="resumen-item">
          <p>{equiposDadosDeBaja}</p>
          <h3>Dados de Baja</h3>
        </div>  */}
      </div>

      <div className="card dashboard-card">
        <ListadoGeneral />
      </div>

      <button onClick={logout}>Cerrar sesion</button>
    </div>
  );
};

export default Dashboard;
