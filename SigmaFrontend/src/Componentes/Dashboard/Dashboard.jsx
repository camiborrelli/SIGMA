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
  FaExclamationTriangle,
  FaTools,
  FaTrashAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { API_URL } from "../../../api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isEquipoModalOpen, setIsEquipoModalOpen] = useState(false);
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);
  const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const getItemsPorPagina = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;                               
  };

  const [paginaGarantia, setPaginaGarantia] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(getItemsPorPagina());

  useEffect(() => {
    const handleResize = () => setItemsPorPagina(getItemsPorPagina());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
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
  const [garantiasPorVencer, setGarantiasPorVencer] = useState([]);
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStatsUnidades = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/unidades/stats`, { headers });
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
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
      const res = await fetch(`${API_URL}/equipos/stats`, { headers });
      const data = await res.json();
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      if (res.ok) setStatsEquipos({ total: data.total || 0 });
    } catch (err) {
      console.error("Error equipos stats:", err);
    }
  };

  const fetchGarantiasPorVencer = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/unidades/garantias/por-vencer`, { headers });
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }
      if (!res.ok) return;
      const data = await res.json();
      setGarantiasPorVencer(Array.isArray(data) ? data : []);
      setPaginaGarantia(0);
    } catch (err) {
      console.error("Error garantias por vencer:", err);
    }
  };

  useEffect(() => {
    fetchStatsUnidades();
    fetchStatsEquipos();
    fetchGarantiasPorVencer();
  }, []);

  const registrarEquipo = () => setIsEquipoModalOpen(true);
  const registrarObra = () => setIsObraModalOpen(true);
  const refrescarDatosUnidades = () => {
    fetchStatsUnidades();
    fetchGarantiasPorVencer();
  };

  const totalPaginasGarantia = Math.ceil(garantiasPorVencer.length / itemsPorPagina);
  const garantiasVisibles = garantiasPorVencer.slice(
    paginaGarantia * itemsPorPagina,
    (paginaGarantia + 1) * itemsPorPagina
  );

  const anteriorGarantia = () => {
    setPaginaGarantia((p) => Math.max(0, p - 1));
  };

  const siguienteGarantia = () => {
    setPaginaGarantia((p) => Math.min(totalPaginasGarantia - 1, p + 1));
  };

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
        <div className="summary-card summary-card--garantias">
          <div className="summary-card__icon">
            <FaExclamationTriangle />
          </div>
          <div className="summary-card__content">
            <button
              className="btn-link"
              onClick={() => navigate("/garantias-vencer")}
            >
              <p className="summary-card__number">
                {garantiasPorVencer.length}
              </p>
              <h4 className="summary-card__label">Garantias por vencer</h4>
            </button>
          </div>
        </div>
      </div>

      {garantiasPorVencer.length > 0 && (
        <div className="dashboard-card dashboard-card--garantias">
          <div className="dashboard-section-heading">
            <div>
              <h2>Garantias por vencer</h2>
              <p>Vencen dentro de los próximos 30 días.</p>
            </div>
            <button
              className="btn btn-ver-todas-dashboard"
              onClick={() => navigate("/garantias-vencer")}
            >
              Ver todas
            </button>
          </div>

          <div className="dashboard-garantias-carousel-container">
            <button
              type="button"
              className="dashboard-carousel-btn"
              onClick={anteriorGarantia}
              disabled={paginaGarantia === 0}
            >
              <FaChevronLeft />
            </button>

            <div className="garantias-dashboard-list">
              {garantiasVisibles.map((garantia) => (
                <button
                  type="button"
                  className="garantia-dashboard-item"
                  key={garantia._id}
                  onClick={() => navigate(`/garantia/${garantia._id}`)}
                >
                  <span className="garantia-dashboard-id">
                    {garantia.identificador}
                  </span>
                  <span className="garantia-dashboard-name">
                    {garantia.equipo?.nombre ||
                      garantia.equipo?.codigo ||
                      "Equipo sin nombre"}
                  </span>
                  <strong className="garantia-dashboard-days">
                    {garantia.diasRestantes} día(s)
                  </strong>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="dashboard-carousel-btn"
              onClick={siguienteGarantia}
              disabled={paginaGarantia >= totalPaginasGarantia - 1}
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="dashboard-carousel-indicator">
            Página {paginaGarantia + 1} de {totalPaginasGarantia}
          </div>
        </div>
      )}

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
          onUpdated={refrescarDatosUnidades}
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
          fetchGarantiasPorVencer();
          setRefreshKey((prev) => prev + 1);
        }}
      />

      <RegistroObra
        isOpen={isObraModalOpen}
        onClose={() => setIsObraModalOpen(false)}
        onSuccess={() => {
          fetchStatsUnidades();
          fetchGarantiasPorVencer();
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
          fetchGarantiasPorVencer();
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