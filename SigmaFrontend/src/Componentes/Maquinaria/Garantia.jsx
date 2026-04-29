import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Garantia.css";
import AsignarMantenimiento from "./AsignaraMantenimiento";

const Garantia = ({ id: propId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const id = propId || params.id;
  const [garantia, setGarantia] = useState(null);
  const [maquinariaNombre, setMaquinariaNombre] = useState("");
  const [maquinaId, setMaquinaId] = useState(null);
  const [cantReparaciones, setCantReparaciones] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch (e) {
      return iso;
    }
  };

  useEffect(() => {
    let mounted = true;
    const obtenerGarantia = async () => {
      if (!id) return;
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(
          `http://localhost:5001/maquinaria/garantia/${id}`,
          { headers },
        );
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) setError(r.error || "Error al obtener garantía");
          return;
        }
        const data = await res.json();
        if (mounted) {
          setGarantia(data);
          setMaquinariaNombre(data.maquinariaNombre || data.nombre || "");
          setMaquinaId(data._id);
        }
      } catch (err) {
        if (mounted) setError("Error de conexión");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const cantReparaciones = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:5001/maquinaria/${id}/reparaciones`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted)
            setError(r.error || "Error al obtener cantidad de reparaciones");
          return;
        }
        const data = await res.json();
        if (mounted) {
          setCantReparaciones(data.cantReparaciones);
        }
      } catch (err) {
        if (mounted) setError("Error de conexión");
      }
    };

    obtenerGarantia();
    cantReparaciones();
    return () => {
      mounted = false;
    };
  }, [id]);

  const porcentajeVidaUtil = garantia
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((new Date(garantia.fechaFinGarantia) - new Date()) /
              (new Date(garantia.fechaFinGarantia) -
                new Date(garantia.fechaCompra))) *
              100,
          ),
        ),
      )
    : 0;

  // Mock covered components — replace with real data from API if available
  const componentes = garantia?.componentes || [
    {
      id: 1,
      nombre: "EARTH_ENGINE",
      subtitulo: "MOTOR",
      descripcion:
        "Protección completa contra fallas internas del bloque y sistemas de inyección.",
      icono: "engine",
    },
    {
      id: 2,
      nombre: "Sistema Hidráulico",
      subtitulo: null,
      descripcion:
        "Cubre bombas, válvulas de control y cilindros de accionamiento principal.",
      icono: "hydraulic",
    },
    {
      id: 3,
      nombre: "Transmisión",
      subtitulo: null,
      descripcion:
        "Engranajes, ejes y sistemas de rodamiento de alto resistencia.",
      icono: "transmission",
    },
  ];

  const poliza = garantia?.poliza || {
    nombre: "Póliza de Servicio Técnico",
    tamaño: "4.2 MB",
    actualizado: "hace 2 días",
    url: "#",
  };

  return (
    <div className="garantia-wrapper">
      {/* Top meta */}
      <p className="garantia-meta">ASSET SERIAL: CAT320D-2024-3</p>

      {/* Page title */}
      <h1 className="garantia-titulo">DETALLE DE GARANTÍA</h1>

      <div className="garantia-body">
        {loading && <p className="garantia-loading">Cargando garantía...</p>}
        {error && <p className="garantia-error">{error}</p>}
        {!loading && !error && !garantia && (
          <p className="garantia-empty">No se encontraron datos de garantía.</p>
        )}

        {garantia && (
          <>
            {/* Machine card */}
            <div className="maquina-card">
              <div className="maquina-info">
                <h2 className="maquina-nombre">{maquinariaNombre || "-"}</h2>
                <p className="maquina-tipo">
                  {garantia.tipo || "Standard Manufacturer"}
                  <br />
                  {garantia.cobertura || "Protection"}
                </p>
              </div>
              {garantia.estado && (
                <span
                  className={`maquina-badge ${garantia.estado === "activa" ? "badge-activa" : "badge-otro"}`}
                >
                  {garantia.estado === "activa" ? "● ACTIVO" : garantia.estado}
                </span>
              )}
            </div>

            {/* Vida útil */}
            {garantia.esGarantia ? (
              <div className="vida-util-section">
                <div className="vida-util-numero">
                  <span className="porcentaje-grande">
                    {porcentajeVidaUtil}%
                  </span>
                  <span className="vida-util-label">VIDA ÚTIL RESTANTE</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${porcentajeVidaUtil}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${porcentajeVidaUtil}%` }}
              />
            </div>

            {/* Garantía activa banner */}
            {garantia.enGarantia ? (
              <div className="garantia-activa-card">
                <div className="check">✓</div>
                <div className="garantia-activa-content">
                  <h4>GARANTÍA ACTIVA</h4>
                  <p>
                    Su activo está completamente cubierto bajo los términos del
                    fabricante.
                  </p>
                  <p style={{ marginTop: 8, fontWeight: 700 }}>
                    {garantia.diasRestantes} días restantes
                  </p>
                </div>
              </div>
            ) : (
              <div className="garantia-expirada-card">
                <div className="expirada-icon">⚠</div>
                <div className="garantia-expirada-content">
                  <h4>GARANTÍA EXPIRADA</h4>
                  <p>La garantía de este activo ha vencido.</p>
                  <p style={{ marginTop: 8, color: "#6b7280" }}>
                    Venció: {formatDate(garantia.fechaFinGarantia)}
                  </p>
                </div>
              </div>
            )}

            {/* Fechas */}
            <div className="fechas-section">
              <div className="fecha-card">
                <div className="fecha-icono">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="1"
                      y="3"
                      width="14"
                      height="12"
                      rx="2"
                      stroke="#b91c1c"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path d="M1 7h14" stroke="#b91c1c" strokeWidth="1.5" />
                    <path
                      d="M5 1v4M11 1v4"
                      stroke="#b91c1c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="fecha-label">INICIO DE COBERTURA</p>
                  <p className="fecha-valor">
                    {formatDate(garantia.fechaCompra)}
                  </p>
                </div>
              </div>

              <div className="fecha-card">
                <div className="fecha-icono">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="1"
                      y="3"
                      width="14"
                      height="12"
                      rx="2"
                      stroke="#b91c1c"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path d="M1 7h14" stroke="#b91c1c" strokeWidth="1.5" />
                    <path
                      d="M5 1v4M11 1v4"
                      stroke="#b91c1c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="fecha-label">VENCIMIENTO</p>
                  <p className="fecha-valor">
                    {formatDate(garantia.fechaFinGarantia)}
                  </p>
                </div>
              </div>
              <p>{cantReparaciones ?? 0} reparaciones realizadas</p>
            </div>
          </>
        )}
      </div>

      {/* Sticky bottom actions */}
      <div className="garantia-acciones">
        <button className="btn-asign" onClick={() => setShowModal(true)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ marginRight: 8 }}
          >
            <path
              d="M8 1v10M4 7l4 4 4-4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 13h12"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          ENVIAR A MANTENIMIENTO
        </button>
        <button className="btn-cancel" onClick={() => navigate(-1)}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ marginRight: 6 }}
          >
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="#374151"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          CANCELAR
        </button>
      </div>

      {showModal && (
        <AsignarMantenimiento id={id} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

// Small icon component
const ComponentIcon = ({ tipo }) => {
  if (tipo === "engine") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="6"
          width="14"
          height="9"
          rx="2"
          stroke="#374151"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M7 6V4M13 6V4"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 10H1M19 10h-2"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="10.5"
          r="2"
          stroke="#374151"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>
    );
  }
  if (tipo === "hydraulic") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="#374151"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M10 6v4l3 2"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // transmission
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="5"
        cy="10"
        r="3"
        stroke="#374151"
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        cx="15"
        cy="10"
        r="3"
        stroke="#374151"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M8 10h4"
        stroke="#374151"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Garantia;
