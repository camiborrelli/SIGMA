import React, { useState, useEffect } from "react";
import ListadoGeneral from "../Equipo/ListadoGeneral";
import ListadoUsuarios from "../Usuario/ListadoUsuarios";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

import RegistrarEquipo from "../Equipo/RegistrarEquipo";
import RegistroObra from "../Obra/RegistroObra";
import RegistrarUnidad from "../Unidad/RegistrarUnidad";
import ModalFiltros from "../Unidad/ModalFiltros";

import { VscTools } from "react-icons/vsc";
import {
  FaBoxes,
  FaCheckCircle,
  FaClipboardList,
  FaTools,
  FaTrashAlt,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);
  const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

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
  const [statsEquipos, setStatsEquipos] = useState({ total: 0 });
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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
      console.error("Error stats unidades:", err);
    }
  };

  const fetchStatsEquipos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("http://localhost:5001/equipos/stats", {
        headers,
      });
      const data = await res.json();
      if (res.ok) setStatsEquipos({ total: data.total || 0 });
    } catch (err) {
      console.error("Error equipos stats:", err);
    }
  };

  useEffect(() => {
    fetchStatsUnidades();
    fetchStatsEquipos();
  }, []);

  const registrarEquipo = () => setIsEquipoModalOpen(true);
  const registrarObra = () => setIsObraModalOpen(true);
  const verMapa = () => navigate("/mapa");

  return (
    <div className="container">
      <div className="container-inicio-dashboard">
        <div className="inicio-texto">
          <h1 className="titulo-principal">Gestión de equipos</h1>
          <p>Administra máquinas y herramientas de la empresa Transamerican</p>
        </div>

        {rol === "Admin" && (
          <div className="inicio-acciones">
            <button className="btn btn-acciones">Registro de acciones</button>
            <button className="btn btn-register" onClick={registrarEquipo}>
              + Nuevo equipo
            </button>
            <button className="btn btn-register" onClick={registrarObra}>
              + Nueva obra
            </button>
          </div>
        )}
      </div>

      <div className="summary-grid">
        <div className="summary-card summary-card--equipos">
          <div className="summary-card__icon">
            <VscTools />
          </div>
          <div className="summary-card__content">
            <p className="summary-card__number">{statsEquipos.total}</p>
            <h4 className="summary-card__label">Total equipos</h4>
          </div>
        </div>
        <div className="summary-card summary-card--total">
          <div className="summary-card__icon">
            <FaBoxes />
          </div>
          <div className="summary-card__content">
            <p className="summary-card__number">{stats.total}</p>
            <h4 className="summary-card__label">Total unidades</h4>
          </div>
        </div>
        <div className="summary-card summary-card--disponibles">
          <div className="summary-card__icon">
            <FaCheckCircle />
          </div>
          <div className="summary-card__content">
            <button
              className="btn-link"
              onClick={() => setFiltroSeleccionado("Disponible")}
            >
              <p className="summary-card__number">{stats.disponibles}</p>
              <h4 className="summary-card__label">Disponibles</h4>
            </button>
          </div>
        </div>
        <div className="summary-card summary-card--asignadas">
          <div className="summary-card__icon">
            <FaClipboardList />
          </div>
          <div className="summary-card__content">
            <button
              className="btn-link"
              onClick={() => setFiltroSeleccionado("Asignada")}
            >
              <p className="summary-card__number">{stats.asignadas}</p>
              <h4 className="summary-card__label">Asignadas</h4>
            </button>
          </div>
        </div>
        <div className="summary-card summary-card--mantenimiento">
          <div className="summary-card__icon">
            <FaTools />
          </div>
          <div className="summary-card__content">
            <button
              className="btn-link"
              onClick={() => setFiltroSeleccionado("Mantenimiento")}
            >
              <p className="summary-card__number">{stats.mantenimiento}</p>
              <h4 className="summary-card__label">Mantenimiento</h4>
            </button>
          </div>
        </div>
        <div className="summary-card summary-card--debaja">
          <div className="summary-card__icon">
            <FaTrashAlt />
          </div>
          <div className="summary-card__content">
            <button
              className="btn-link"
              onClick={() => setFiltroSeleccionado("De Baja")}
            >
              <p className="summary-card__number">{stats.bajas}</p>
              <h4 className="summary-card__label">Dados de baja</h4>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Listado de equipos</h2>
        <div className="filters-top">
          <input
            className="filters-input"
            placeholder="Buscar equipo por nombre o modelo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="filters-select"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="Maquina">Máquinas</option>
            <option value="Herramienta">Herramientas</option>
          </select>
        </div>
        <ListadoGeneral
          refreshKey={refreshKey}
          onUpdated={fetchStatsUnidades}
          tipoFilter={tipoFilter}
          estadoFilter={estadoFilter}
          busquedaProp={searchQuery}
          onRegistrarUnidadClick={(id) => {
            setSelectedEquipoId(id);
            setIsUnidadModalOpen(true);
          }}
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

      <RegistrarEquipo
        isOpen={isEquipoModalOpen}
        onClose={() => setIsEquipoModalOpen(false)}
        onSuccess={() => {
          fetchStatsEquipos();
          fetchStatsUnidades();
          setRefreshKey((prev) => prev + 1);
        }}
      />

      <RegistroObra
        isOpen={isObraModalOpen}
        onClose={() => setIsObraModalOpen(false)}
        onSuccess={() => {
          fetchStatsUnidades();
        }}
      />

      <RegistrarUnidad
        isOpen={isUnidadModalOpen}
        onClose={() => {
          setIsUnidadModalOpen(false);
          setSelectedEquipoId("");
        }}
        initialEquipoId={selectedEquipoId}
        onSuccess={() => {
          fetchStatsUnidades();
          setRefreshKey((prev) => prev + 1);
        }}
      />
      {filtroSeleccionado && (
        <ModalFiltros
          estadoFilter={filtroSeleccionado}
          setEstadoFilter={setFiltroSeleccionado}
        />
      )}
    </div>
  );
};

export default Dashboard;
