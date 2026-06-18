import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { API_URL } from "../../../api";
import "./GestionMantenimiento.css";
import { useNavigate } from "react-router-dom";

const GestionMantenimiento = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState({});
  const [guardando, setGuardando] = useState({});
  const [historialAbierto, setHistorialAbierto] = useState({});
  const [garantia, setGarantia] = useState({});
  const [garantias, setGarantias] = useState({});

  const navigate = useNavigate();

  const fetchUnidadesMantenimiento = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/unidades/mantenimiento`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      if (!res.ok) throw new Error("Error al cargar unidades en mantenimiento");
      const data = await res.json();
      setUnidades(Array.isArray(data) ? data : []);
      console.log("status:", res.status, "data:", data);
    } catch (err) {
      console.error("Error al cargar unidades en mantenimiento:", err);
      toast.error("No se pudieron cargar las unidades en mantenimiento");
      setUnidades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidadesMantenimiento();
  }, []);
  // Devuelve la entrada activa (sin fechaFin) del historial de mantenimiento
  const getEntradaActiva = (unidad) => {
    const historial = unidad.historialMantenimiento || [];
    return [...historial].reverse().find((h) => !h.fechaFin) || null;
  };

  const getDiasEnMantenimiento = (fechaInicio) => {
    if (!fechaInicio) return null;
    return dayjs().diff(dayjs(fechaInicio), "day");
  };

  const buildFotoSrc = (foto) => {
    if (!foto) return null;
    return foto.startsWith("http") ? foto : `${API_URL}/${foto}`;
  };

  const handleComentarioChange = (unidadId, value) => {
    setComentarios((prev) => ({ ...prev, [unidadId]: value }));
  };

  const toggleHistorial = (unidadId) => {
    setHistorialAbierto((prev) => ({ ...prev, [unidadId]: !prev[unidadId] }));
  };

  const guardarComentario = async (unidad) => {
    const texto = (comentarios[unidad._id] || "").trim();
    if (!texto) {
      toast.error("Escribí un comentario antes de guardar");
      return;
    }

    setGuardando((prev) => ({ ...prev, [unidad._id]: true }));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/unidades/${unidad._id}/comentario-mantenimiento`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ comentario: texto }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Comentario agregado");
      setComentarios((prev) => ({ ...prev, [unidad._id]: "" }));
      fetchUnidadesMantenimiento();
    } catch (err) {
      toast.error("Error al guardar el comentario");
    } finally {
      setGuardando((prev) => ({ ...prev, [unidad._id]: false }));
    }
  };

  const obtenerGarantia = async (unidad) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/unidades/garantia/${unidad._id}`, {
        headers,
      });
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      if (!res.ok) throw new Error("Error al obtener garantía");
      const data = await res.json();
      setGarantia(data);
      return data.garantia || {};
    } catch (err) {
      console.error("Error al obtener garantía:", err);
      return {};
    }
  };

  // return {
  //   _id: unidad._id,
  //   nombre: unidad.identificador,
  //   fechaCompra: null,
  //   fechaFinGarantia: null,
  //   enGarantia: false,
  //   diasRestantes: 0,
  //   estado: unidad.estado,
  //   cantReparaciones: unidad.cantReparaciones || 0,
  //   historialMantenimiento: unidad.historialMantenimiento || [],
  // };

  const finalizarMantenimiento = async (unidad) => {
    if (!unidad._id) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/unidades/mantenimiento/finalizar/${unidad._id}`,
        {
          method: "POST",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Mantenimiento finalizado");
      // refrescar datos
    } catch {
      toast.error("Error al finalizar mantenimiento");
    }
  };

  const cantReparaciones = async (unidadId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/unidades/${unidadId}/reparaciones`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setCantReparaciones(data.cantReparaciones || 0);
      }
    } catch (err) {
      console.error("Error al obtener cantidad de reparaciones:", err);
    }
  };

  return (
    <div className="gm-carousel">
      {unidades.map((unidad) => {
        const activa = getEntradaActiva(unidad);
        const dias = getDiasEnMantenimiento(activa?.fechaInicio);
        const fotoSrc = buildFotoSrc(activa?.foto);

        const abierto = historialAbierto[unidad._id] || false;
        const historialPrevio =
          unidad.historialMantenimiento?.filter((h) => h.fechaFin) || [];

        const garantiaUnidad = garantias[unidad._id] || {};

        return (
          <div key={unidad._id} className="gm-card">
            <div className="gm-card-header">
              <h2>{unidad.nombre}</h2>

              <span
                className={`gm-status ${
                  garantiaUnidad.enGarantia ? "activa" : "vencida"
                }`}
              >
                {garantiaUnidad.enGarantia ? "GARANTÍA ACTIVA" : "SIN GARANTÍA"}
              </span>
            </div>

            <div className="gm-top-section">
              <div className="gm-card-photo">
                {fotoSrc ? (
                  <img src={fotoSrc} alt={unidad.nombre} />
                ) : (
                  <i className="ti ti-photo-off" />
                )}
              </div>

              <div className="gm-info">
                <div className="gm-info-title">Mantenimiento en progreso</div>

                <div className="gm-days">
                  {dias || 0}
                  <span>días</span>
                </div>
              </div>
            </div>

            <div className="gm-progress">
              <div
                className="gm-progress-bar"
                style={{
                  width: `${Math.min(((dias || 0) / 30) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="gm-card-body">
              <div className="gm-meta-row">
                📍 {activa?.destino || "Sin destino"}
              </div>

              <div className="gm-meta-row">
                👤 {activa?.usuario || "Sin responsable"}
              </div>

              <div className="gm-meta-row">
                📅{" "}
                {activa?.fechaInicio
                  ? dayjs(activa.fechaInicio).format("DD/MM/YYYY")
                  : "Sin fecha"}
              </div>

              <div className="gm-meta-row">
                🔧 Reparaciones: {garantiaUnidad.cantReparaciones || 0}
              </div>

              {/* comentario */}
              <div className="gm-comment-row">
                <textarea
                  value={comentarios[unidad._id] || ""}
                  onChange={(e) =>
                    handleComentarioChange(unidad._id, e.target.value)
                  }
                />

                <button
                  className="gm-btn-send"
                  onClick={() => guardarComentario(unidad)}
                >
                  ➤
                </button>
              </div>

              {/* acciones */}
              <div className="gm-actions">
                <button
                  className="gm-btn-action gm-btn-finish"
                  onClick={() => finalizarMantenimiento(unidad)}
                >
                  Finalizar
                </button>

                <button
                  className="gm-btn-action gm-btn-garantia"
                  onClick={() => navigate(`/garantia/${unidad._id}`)}
                >
                  Garantía
                </button>
              </div>

              {/* historial */}
              {historialPrevio.length > 0 && (
                <>
                  <span
                    className="gm-history-toggle"
                    onClick={() => toggleHistorial(unidad._id)}
                  >
                    {abierto
                      ? "Ocultar historial"
                      : `Ver historial (${historialPrevio.length})`}
                  </span>

                  {abierto && (
                    <ul className="gm-history-list">
                      {historialPrevio
                        .slice()
                        .reverse()
                        .map((h, idx) => (
                          <li key={idx} className="gm-history-item">
                            {h.destino}
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  {
    /* {garantiaSeleccionada && (
        <div className="gm-modal">
          <div className="gm-modal-content">
            <h3>Garantía</h3>

            <p>
              Fecha compra:{" "}
              {garantiaSeleccionada.fechaCompra
                ? dayjs(garantiaSeleccionada.fechaCompra).format("DD/MM/YYYY")
                : "-"}
            </p>

            <p>
              Fin garantía:{" "}
              {garantiaSeleccionada.fechaFinGarantia
                ? dayjs(garantiaSeleccionada.fechaFinGarantia).format(
                    "DD/MM/YYYY",
                  )
                : "-"}
            </p>

            <p>
              Estado: {garantiaSeleccionada.enGarantia ? "Activa" : "Vencida"}
            </p>

            <button onClick={() => navigate(-1      )}>
              Cerrar
            </button>
          </div>
        </div>
      )} */
  }
};

export default GestionMantenimiento;
