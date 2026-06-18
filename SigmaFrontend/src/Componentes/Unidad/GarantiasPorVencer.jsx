import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaRedo,
  FaSearch,
  FaTools,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { API_URL } from "../../../api";
import "./GarantiasPorVencer.css";

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("es-UY") : "-";

const getEquipoNombre = (garantia) => {
  const equipo = garantia.equipo;
  if (!equipo || typeof equipo !== "object") return "Equipo sin nombre";
  return equipo.nombre || equipo.codigo || "Equipo sin nombre";
};

const getEquipoDetalle = (garantia) => {
  const equipo = garantia.equipo;
  if (!equipo || typeof equipo !== "object") return "";
  return [equipo.codigo, equipo.modelo, equipo.tipo].filter(Boolean).join(" | ");
};

const getUbicacion = (garantia) => {
  const ubicacion = garantia.ubicacion;
  if (!ubicacion) return "Sin asignar";
  if (typeof ubicacion === "object") return ubicacion.nombre || "Sin asignar";
  return String(ubicacion);
};

const GarantiasPorVencer = () => {
  const navigate = useNavigate();
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [indiceActual, setIndiceActual] = useState(0);

  const cargarGarantias = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/unidades/garantias/por-vencer`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data.error || "Error al obtener garantias por vencer");
      }

      setGarantias(Array.isArray(data) ? data : []);
      setIndiceActual(0);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudieron cargar las garantias");
      setGarantias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGarantias();
  }, []);

  const garantiasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return garantias;

    return garantias.filter((garantia) => {
      const campos = [
        garantia.identificador,
        garantia.etiqueta,
        getEquipoNombre(garantia),
        getEquipoDetalle(garantia),
        getUbicacion(garantia),
        garantia.estado,
      ];

      return campos
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(texto));
    });
  }, [busqueda, garantias]);

  useEffect(() => {
    setIndiceActual(0);
  }, [busqueda]);

  const irAnterior = () => {
    if (indiceActual > 0) setIndiceActual(indiceActual - 1);
  };

  const irSiguiente = () => {
    if (indiceActual < garantiasFiltradas.length - 1) setIndiceActual(indiceActual + 1);
  };

  const garantiaActual = garantiasFiltradas[indiceActual];

  return (
    <div className="garantias-vencer-page">
      <section className="garantias-vencer-header">
        <div>
          <p className="garantias-vencer-eyebrow">Alertas de garantia</p>
          <h1>Garantias por vencer</h1>
          <p>
            Unidades con garantia vigente que vence dentro de los proximos 30
            dias.
          </p>
        </div>
        <div className="garantias-vencer-counter">
          <FaExclamationTriangle />
          <span>{garantias.length}</span>
        </div>
      </section>

      <section className="garantias-vencer-toolbar">
        <label className="garantias-vencer-search">
          <FaSearch />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por unidad, equipo u obra"
          />
        </label>
        <button
          type="button"
          className="garantias-vencer-refresh"
          onClick={cargarGarantias}
          disabled={loading}
          title="Actualizar"
        >
          <FaRedo />
          <span>{loading ? "Actualizando..." : "Actualizar"}</span>
        </button>
      </section>

      <section className="garantias-vencer-content">
        {loading && <p className="garantias-vencer-state">Cargando...</p>}

        {!loading && error && (
          <p className="garantias-vencer-state garantias-vencer-state--error">
            {error}
          </p>
        )}

        {!loading && !error && garantias.length === 0 && (
          <p className="garantias-vencer-state">
            No hay garantias por vencer en los proximos 30 dias.
          </p>
        )}

        {!loading && !error && garantias.length > 0 && (
          <div>
            {garantiasFiltradas.length === 0 ? (
              <p className="garantias-vencer-state">
                No hay resultados para esa busqueda.
              </p>
            ) : (
              <div className="garantias-vencer-carousel">
                <button
                  type="button"
                  className="garantias-vencer-control"
                  onClick={irAnterior}
                  disabled={indiceActual === 0}
                >
                  <FaChevronLeft />
                </button>

                <div className="garantias-vencer-list">
                  <article className="garantia-vencer-item">
                    <div className="garantia-vencer-main">
                      <div className="garantia-vencer-icon">
                        <FaTools />
                      </div>
                      <div>
                        <h3>{garantiaActual.identificador}</h3>
                        <p>{getEquipoNombre(garantiaActual)}</p>
                        {getEquipoDetalle(garantiaActual) && (
                          <span>{getEquipoDetalle(garantiaActual)}</span>
                        )}
                      </div>
                    </div>

                    <div className="garantia-vencer-meta">
                      <div>
                        <FaCalendarAlt />
                        <span>Vence {formatDate(garantiaActual.fechaFinGarantia)}</span>
                      </div>
                      <div>
                        <FaMapMarkerAlt />
                        <span>{getUbicacion(garantiaActual)}</span>
                      </div>
                    </div>

                    <div className="garantia-vencer-actions">
                      <span className="garantia-vencer-days">
                        {garantiaActual.diasRestantes} dia(s)
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/garantia/${garantiaActual._id}`)}
                      >
                        Ver garantia
                      </button>
                    </div>
                  </article>
                  
                  <div className="garantias-vencer-indicator">
                    Tarjeta {indiceActual + 1} de {garantiasFiltradas.length}
                  </div>
                </div>

                <button
                  type="button"
                  className="garantias-vencer-control"
                  onClick={irSiguiente}
                  disabled={indiceActual === garantiasFiltradas.length - 1}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default GarantiasPorVencer;