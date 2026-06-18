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

  const [garantias, setGarantias] = useState({});

  const navigate = useNavigate();

  const fetchUnidadesMantenimiento = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/unidades/mantenimiento`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setUnidades(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar unidades");
      setUnidades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidadesMantenimiento();
  }, []);

  useEffect(() => {
    if (!unidades.length) return;

    const cargarGarantias = async () => {
      const nuevas = {};

      await Promise.all(
        unidades.map(async (u) => {
          const g = await obtenerGarantia(u._id);
          nuevas[u._id] = g?.garantia || g || {};
        }),
      );

      setGarantias(nuevas);
    };

    cargarGarantias();
  }, [unidades]);

  const obtenerGarantia = async (unidadId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/unidades/garantia/${unidadId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) return null;

      return await res.json();
    } catch {
      return null;
    }
  };

  const getEntradaActiva = (unidad) => {
    const historial = unidad.historialMantenimiento || [];
    return [...historial].reverse().find((h) => !h.fechaFin) || null;
  };

  const getDiasEnMantenimiento = (fechaInicio) => {
    if (!fechaInicio) return 0;
    return dayjs().diff(dayjs(fechaInicio), "day");
  };

  const buildFotoSrc = (foto) => {
    if (!foto) return null;
    return foto.startsWith("http") ? foto : `${API_URL}/${foto}`;
  };

  const toggleHistorial = (id) => {
    setHistorialAbierto((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleComentarioChange = (id, value) => {
    setComentarios((p) => ({ ...p, [id]: value }));
  };

  const guardarComentario = async (unidad) => {
    const texto = (comentarios[unidad._id] || "").trim();

    if (!texto) {
      toast.error("Escribí un comentario");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await fetch(
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

      toast.success("Comentario guardado");

      setComentarios((p) => ({ ...p, [unidad._id]: "" }));
      fetchUnidadesMantenimiento();
    } catch {
      toast.error("Error al guardar comentario");
    }
  };

  const finalizarMantenimiento = async (unidad) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/unidades/mantenimiento/finalizar/${unidad._id}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!res.ok) throw new Error();

      toast.success("Finalizado");

      fetchUnidadesMantenimiento();
    } catch {
      toast.error("Error al finalizar");
    }
  };

  return (
    <div className="gm-carousel">
      {Array.isArray(unidades) &&
        unidades.map((unidad) => {
          const activa = getEntradaActiva(unidad);
          const dias = getDiasEnMantenimiento(activa?.fechaInicio);
          const fotoSrc = buildFotoSrc(activa?.foto);

          const garantiaUnidad = garantias[unidad._id] || {};
          const enGarantia = garantiaUnidad?.enGarantia === true;

          const historialPrevio =
            unidad.historialMantenimiento?.filter((h) => h.fechaFin) || [];

          const abierto = historialAbierto[unidad._id] || false;

          return (
            <div key={unidad._id} className="gm-card">
              <div className="gm-card-header">
                <h2>{unidad.nombre || garantiaUnidad.nombre}</h2>

                <span
                  className={`gm-status ${enGarantia ? "activa" : "vencida"}`}
                >
                  {enGarantia ? "GARANTÍA ACTIVA" : "SIN GARANTÍA"}
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
                  <div className="gm-info-title">Mantenimiento</div>
                  <div className="gm-days">
                    {dias}
                    <span>días</span>
                  </div>
                </div>
              </div>

              <div className="gm-card-body">
                <div>📍 {activa?.destino || "Sin destino"}</div>
                <div>👤 {activa?.usuario || "Sin responsable"}</div>
                <div>
                  📅{" "}
                  {activa?.fechaInicio
                    ? dayjs(activa.fechaInicio).format("DD/MM/YYYY")
                    : "Sin fecha"}
                </div>
                <div>
                  🔧 Reparaciones: {garantiaUnidad.cantReparaciones || 0}
                </div>

                <textarea
                  value={comentarios[unidad._id] || ""}
                  onChange={(e) =>
                    handleComentarioChange(unidad._id, e.target.value)
                  }
                />

                <button onClick={() => guardarComentario(unidad)}>➤</button>

                <div className="gm-actions">
                  <button onClick={() => finalizarMantenimiento(unidad)}>
                    Finalizar
                  </button>

                  <button onClick={() => navigate(`/garantia/${unidad._id}`)}>
                    Garantía
                  </button>
                </div>

                {historialPrevio.length > 0 && (
                  <>
                    <span onClick={() => toggleHistorial(unidad._id)}>
                      {abierto ? "Ocultar historial" : "Ver historial"}
                    </span>

                    {abierto && (
                      <ul>
                        {historialPrevio.map((h, i) => (
                          <li key={i}>{h.destino}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {activa?.comentarios?.length > 0 && (
                  <div className="gm-comentarios-section">
                    <div className="gm-comentarios-title">
                      Últimos comentarios
                    </div>

                    <div className="gm-comentarios-list">
                      {activa.comentarios
                        .slice(-3) // últimos 3
                        .reverse()
                        .map((c, i) => (
                          <div key={i} className="gm-comentario-card">
                            <div className="gm-comentario-meta">
                              {c.usuario || "Usuario"} ·{" "}
                              {c.fecha
                                ? dayjs(c.fecha).format("DD/MM HH:mm")
                                : ""}
                            </div>

                            <div className="gm-comentario-text">{c.texto}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default GestionMantenimiento;
