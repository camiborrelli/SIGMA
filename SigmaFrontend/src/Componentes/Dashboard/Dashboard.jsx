import React, { useState, useEffect } from "react";
import ListadoGeneral from "../Equipo/ListadoGeneral";
import ListadoUsuarios from "../Usuario/ListadoUsuarios";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/LogoSinFondo.png";
import RegistroObra from "../Obra/RegistroObra";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const registrarEquipo = () => {
    navigate("/registrarEquipo");
  };

  const registrarObra = () => {
    navigate("/registrarObra");
  };

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    usuario = null;
  }

  const rol = usuario ? usuario.rol : null;

  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    asignadas: 0,
    mantenimiento: 0,
    bajas: 0,
  });

  const [statsEquipos, setStatsEquipos] = useState({
    total: 0,
  });
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch("http://localhost:5001/unidades/stats", {
          headers,
        });

        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          console.error("Error stats:", r);
          return;
        }

        const data = await res.json();

        setStats({
          total: data.total || 0,
          disponibles: data.disponibles || 0,
          asignadas: data.asignadas || 0,
          mantenimiento: data.mantenimiento || 0,
          bajas: data.bajas || 0,
        });
      } catch (err) {
        console.error("Error conexión stats:", err);
      }
    };

    fetchStats();
  }, []);

  const fetchStatsUnidades = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch("http://localhost:5001/unidades/stats", {
        headers,
      });
      if (!res.ok) return;
      const data = await res.json();

      setStats({
        total: data.total || 0,
        disponibles: data.disponibles || 0,
        asignadas: data.asignadas || 0,
        mantenimiento: data.mantenimiento || 0,
        bajas: data.bajas || 0,
      });
    } catch (err) {
      console.error("Error al obtener stats de unidades:", err);
    }
  };

  // Llamada inicial
  useEffect(() => {
    fetchStatsUnidades();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchStatsEquipos = async () => {
      try {
        const res = await fetch("http://localhost:5001/equipos/stats", {
          headers,
        });

        const data = await res.json();

        if (res.ok) {
          setStatsEquipos({
            total: data.total || 0,
          });
        }
      } catch (err) {
        console.error("Error equipos stats:", err);
      }
    };

    fetchStatsEquipos();
  }, []);

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-container">
            <img src={logo} alt="Logo empresa" className="logo-img" />
          </div>
        </div>

        <div className="topbar-right">
          <span className="usuario-nombre">
            {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario"}
          </span>
          <button className="btn-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="container">
        <div className="container-inicio-dashboard">
          <div className="inicio-texto">
            <h1 className="titulo-principal">Gestion de equipos</h1>
            <p>
              Administra maquinas y herramientas de la empresa Transamerican
            </p>
          </div>

          {rol === "Admin" && (
            <div className="inicio-acciones">
              <button className="btn btn-acciones">Registro de acciones</button>

              <button className="btn btn-register" onClick={registrarEquipo}>
                + Nuevo Equipo
              </button>

              <button className="btn btn-register" onClick={registrarObra}>
                + Nueva Obra
              </button>
            </div>
          )}
        </div>

        <div className="summary-grid">
          <div className="summary-card summary-card--equipos">
            <p className="summary-card__number">{statsEquipos.total}</p>
            <h4 className="summary-card__label">Total Equipos</h4>
          </div>

          <div className="summary-card summary-card--total">
            <p className="summary-card__number">{stats.total}</p>
            <h4 className="summary-card__label">Total unidades</h4>
          </div>

          <div className="summary-card summary-card--disponibles">
            <p className="summary-card__number">{stats.disponibles}</p>
            <h4 className="summary-card__label">Disponibles</h4>
          </div>

          <div className="summary-card summary-card--asignadas">
            <p className="summary-card__number">{stats.asignadas}</p>
            <h4 className="summary-card__label">Asignadas</h4>
          </div>

          <div className="summary-card summary-card--mantenimiento">
            <p className="summary-card__number">{stats.mantenimiento}</p>
            <h4 className="summary-card__label">Mantenimiento</h4>
          </div>

          <div className="summary-card summary-card--debaja">
            <p className="summary-card__number">{stats.bajas}</p>
            <h4 className="summary-card__label">Dados de baja</h4>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="filters-top">
            <input
              className="filters-input"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="filters-select"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="Maquina">Maquinas</option>
              <option value="Herramienta">Herramientas</option>
            </select>
          </div>
        </div>
        
          <div className="dashboard-card">
            <ListadoGeneral
              onUpdated={fetchStatsUnidades}
              tipoFilter={tipoFilter}
              estadoFilter={estadoFilter}
              busquedaProp={searchQuery}
            />
          </div>

        {rol === "Admin" && (
          <>
            <div className="container-inicio-dashboard">
              <div className="inicio-texto">
                <h1 className="titulo-principal">Gestión de usuarios</h1>
                <p>Administra los funcionarios del sistema</p>
              </div>
            </div>

            <div className="dashboard-card">
              <ListadoUsuarios />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
