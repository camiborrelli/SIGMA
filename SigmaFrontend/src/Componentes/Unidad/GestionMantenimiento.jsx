import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaHistory,
  FaImage,
  FaMapMarkerAlt,
  FaRegCommentDots,
  FaShieldAlt,
  FaSyncAlt,
  FaTools,
  FaUser,
} from "react-icons/fa";
import { API_URL } from "../../../api";
import "./GestionMantenimiento.css";
import { IoSend } from "react-icons/io5";
import { CiCircleRemove } from "react-icons/ci";

dayjs.locale("es");

const GestionMantenimiento = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState({});
  const [guardando, setGuardando] = useState({});
  const [finalizando, setFinalizando] = useState({});
  const [historialAbierto, setHistorialAbierto] = useState({});
  const [garantias, setGarantias] = useState({});
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

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
        throw new Error("Sesion expirada");
      }

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
    if (!unidades.length) {
      setGarantias({});
      return;
    }

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

  const getUnidadNombre = (unidad, garantiaUnidad = {}) =>
    unidad.identificador ||
    garantiaUnidad.nombre ||
    unidad.nombre ||
    "Unidad sin identificar";

  const getEquipoNombre = (unidad) => {
    if (unidad.equipo && typeof unidad.equipo === "object") {
      return [unidad.equipo.nombre, unidad.equipo.modelo]
        .filter(Boolean)
        .join(" - ");
    }

    return "Equipo sin detalle";
  };

  const getUbicacionNombre = (unidad, activa) => {
    if (activa?.destino) return activa.destino;
    if (unidad.ubicacion && typeof unidad.ubicacion === "object") {
      return unidad.ubicacion.nombre || "Sin destino";
    }

    return unidad.ubicacion || "Sin destino";
  };

  const buildFotoSrc = (foto) => {
    if (!foto) return null;
    return foto.startsWith("http") ? foto : `${API_URL}/${foto}`;
  };

  const formatFecha = (fecha) =>
    fecha ? dayjs(fecha).format("DD/MM/YYYY") : "Sin fecha";

  const formatFechaHora = (fecha) =>
    fecha ? dayjs(fecha).format("DD/MM HH:mm") : "";

  const toggleHistorial = (id) => {
    setHistorialAbierto((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleComentarioChange = (id, value) => {
    setComentarios((p) => ({ ...p, [id]: value }));
  };

  const guardarComentario = async (unidad) => {
    const texto = (comentarios[unidad._id] || "").trim();

    if (!texto) {
      toast.error("Escribe un comentario");
      return;
    }

    setGuardando((p) => ({ ...p, [unidad._id]: true }));

    try {
      const token = localStorage.getItem("token");

      const bodyAEnviar = {
        comentario: texto,
        usuario: usuario?.nombre || "Anónimo",
      };
      console.log("body que se va a enviar:", bodyAEnviar);

      const res = await fetch(
        `${API_URL}/unidades/${unidad._id}/comentario-mantenimiento`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            comentario: texto,
            usuario: usuario?.nombre || "Anónimo",
          }),
        },
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }

      if (!res.ok) throw new Error();

      toast.success("Comentario guardado");
      setComentarios((p) => ({ ...p, [unidad._id]: "" }));
      fetchUnidadesMantenimiento();
    } catch {
      toast.error("Error al guardar comentario");
    } finally {
      setGuardando((p) => ({ ...p, [unidad._id]: false }));
    }
  };

  const finalizarMantenimiento = async (unidad) => {
    setFinalizando((p) => ({ ...p, [unidad._id]: true }));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/unidades/mantenimiento/finalizar/${unidad._id}`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }

      if (!res.ok) throw new Error();

      toast.success("Mantenimiento finalizado");
      fetchUnidadesMantenimiento();
    } catch {
      toast.error("Error al finalizar");
    } finally {
      setFinalizando((p) => ({ ...p, [unidad._id]: false }));
    }
  };

  const eliminarComentario = async (comentarioId, unidadId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/unidades/${unidadId}/mantenimiento/comentario/${comentarioId}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }
      if (!res.ok) throw new Error();

      toast.success("Comentario eliminado");
      fetchUnidadesMantenimiento();
    } catch {
      toast.error("Error al eliminar comentario");
    }
  };

  const totalUnidades = unidades.length;
  const unidadesConGarantia = unidades.filter(
    (u) => garantias[u._id]?.enGarantia === true,
  ).length;
  const reparacionesTotales = unidades.reduce(
    (total, unidad) =>
      total + Number(garantias[unidad._id]?.cantReparaciones || 0),
    0,
  );
  const promedioDias = totalUnidades
    ? Math.round(
        unidades.reduce((total, unidad) => {
          const activa = getEntradaActiva(unidad);
          return total + getDiasEnMantenimiento(activa?.fechaInicio);
        }, 0) / totalUnidades,
      )
    : 0;

  return (
    <div className="gm-page">
      <section className="gm-page-header">
        <div>
          <span className="gm-kicker">Mantenimiento</span>
          <h1>Gestion de mantenimiento</h1>
          <p>Unidades activas en taller y seguimiento operativo.</p>
        </div>

        <button
          type="button"
          className="gm-refresh-btn"
          onClick={fetchUnidadesMantenimiento}
          disabled={loading}
        >
          <FaSyncAlt />
          <span>Actualizar</span>
        </button>
      </section>

      <section className="gm-summary-grid" aria-label="Resumen">
        <div className="gm-summary-item">
          <FaClipboardList />
          <div>
            <strong>{totalUnidades}</strong>
            <span>En mantenimiento</span>
          </div>
        </div>

        <div className="gm-summary-item">
          <FaCalendarAlt />
          <div>
            <strong>{promedioDias}</strong>
            <span>Promedio de dias</span>
          </div>
        </div>

        <div className="gm-summary-item">
          <FaShieldAlt />
          <div>
            <strong>{unidadesConGarantia}</strong>
            <span>Con garantia</span>
          </div>
        </div>

        <div className="gm-summary-item">
          <FaTools />
          <div>
            <strong>{reparacionesTotales}</strong>
            <span>Reparaciones</span>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="gm-state">
          <div className="gm-loader" />
          <h2>Cargando mantenimiento</h2>
          <p>Consultando unidades activas.</p>
        </section>
      ) : totalUnidades === 0 ? (
        <section className="gm-state">
          <FaCheckCircle />
          <h2>No hay unidades en mantenimiento</h2>
          <p>El tablero esta al dia.</p>
        </section>
      ) : (
        <section className="gm-grid">
          {unidades.map((unidad) => {
            const activa = getEntradaActiva(unidad);
            const dias = getDiasEnMantenimiento(activa?.fechaInicio);
            const fotoSrc = buildFotoSrc(activa?.foto);
            const garantiaUnidad = garantias[unidad._id] || {};
            const enGarantia = garantiaUnidad?.enGarantia === true;
            const historialPrevio =
              unidad.historialMantenimiento?.filter((h) => h.fechaFin) || [];
            const abierto = historialAbierto[unidad._id] || false;
            const comentariosActivos = activa?.comentarios || [];
            const nombreUnidad = getUnidadNombre(unidad, garantiaUnidad);

            return (
              <article key={unidad._id} className="gm-card">
                <header className="gm-card-header">
                  <div>
                    <span className="gm-unit-code">{nombreUnidad}</span>
                    <h2>{getEquipoNombre(unidad)}</h2>
                  </div>

                  <span
                    className={`gm-status ${
                      enGarantia ? "gm-status-active" : "gm-status-expired"
                    }`}
                  >
                    {enGarantia ? "Garantia activa" : "Sin garantia"}
                  </span>
                </header>

                <div className="gm-card-main">
                  <div className="gm-card-photo">
                    {fotoSrc ? (
                      <img
                        src={fotoSrc}
                        alt={nombreUnidad}
                        onClick={() => setImagenSeleccionada(fotoSrc)}
                      />
                    ) : (
                      <FaImage />
                    )}
                  </div>

                  <div className="gm-duration">
                    <span>Tiempo activo</span>
                    <strong>{dias}</strong>
                    <small>{dias === 1 ? "dia" : "dias"}</small>
                  </div>
                </div>

                <dl className="gm-detail-list">
                  <div className="gm-detail-item">
                    <FaMapMarkerAlt />
                    <div>
                      <dt>Destino</dt>
                      <dd>{getUbicacionNombre(unidad, activa)}</dd>
                    </div>
                  </div>

                  <div className="gm-detail-item">
                    <FaUser />
                    <div>
                      <dt>Responsable</dt>
                      <dd>{activa?.usuario || "Sin responsable"}</dd>
                    </div>
                  </div>

                  <div className="gm-detail-item">
                    <FaCalendarAlt />
                    <div>
                      <dt>Inicio</dt>
                      <dd>{formatFecha(activa?.fechaInicio)}</dd>
                    </div>
                  </div>

                  <div className="gm-detail-item">
                    <FaTools />
                    <div>
                      <dt>Reparaciones</dt>
                      <dd>{garantiaUnidad.cantReparaciones || 0}</dd>
                    </div>
                  </div>
                </dl>

                <form
                  className="gm-comment-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    guardarComentario(unidad);
                  }}
                >
                  <label htmlFor={`comentario-${unidad._id}`}>
                    <FaRegCommentDots />
                    Comentario
                  </label>

                  <div className="gm-comment-textarea">
                    <textarea
                      id={`comentario-${unidad._id}`}
                      value={comentarios[unidad._id] || ""}
                      onChange={(e) =>
                        handleComentarioChange(unidad._id, e.target.value)
                      }
                      placeholder="Agregar novedad, diagnostico o pendiente"
                      rows={3}
                    />

                    <button type="submit" disabled={guardando[unidad._id]}>
                      {guardando[unidad._id] ? "Guardando..." : <IoSend />}
                    </button>
                  </div>
                </form>

                {comentariosActivos.length > 0 && (
                  <section className="gm-comments-section">
                    <h3>Ultimos comentarios</h3>

                    <div className="gm-comments-list">
                      {comentariosActivos
                        .slice(-3)
                        .reverse()
                        .map((c, i) => (
                          <div key={i} className="gm-comment">
                            <div className="gm-comment-content">
                              <span>{formatFechaHora(c.fecha)}</span>
                              <p className="gm-comment-text">
                                {c.texto} -{" "}
                              </p>{" "}
                            </div>
                            {/* <p>{c.usuario || "Anónimo"}</p> */}

                            <button
                              style={{
                                marginLeft: "auto",
                                background: "transparent",
                                color: "#e11d48",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 24,
                              }}
                              onClick={() =>
                                eliminarComentario(c._id, unidad._id)
                              }
                            >
                              <CiCircleRemove className="eliminar-commentario" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {historialPrevio.length > 0 && (
                  <section className="gm-history-section">
                    <button
                      type="button"
                      className="gm-history-toggle"
                      onClick={() => toggleHistorial(unidad._id)}
                      aria-expanded={abierto}
                    >
                      <FaHistory />
                      <span>
                        {abierto ? "Ocultar historial" : "Ver historial"}
                      </span>
                    </button>

                    {abierto && (
                      <ul className="gm-history-list">
                        {historialPrevio.map((h, i) => (
                          <li key={i}>
                            <strong>{h.destino || "Sin destino"}</strong>
                            <span>
                              {formatFecha(h.fechaInicio)} -{" "}
                              {formatFecha(h.fechaFin)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                <footer className="gm-actions">
                  <button
                    type="button"
                    className="gm-secondary-action"
                    onClick={() => navigate(`/garantia/${unidad._id}`)}
                  >
                    <FaShieldAlt />
                    Garantia
                  </button>

                  <button
                    type="button"
                    className="gm-primary-action"
                    onClick={() => finalizarMantenimiento(unidad)}
                    disabled={finalizando[unidad._id]}
                  >
                    <FaCheckCircle />
                    {finalizando[unidad._id] ? "Finalizando..." : "Finalizar"}
                  </button>
                </footer>
              </article>
            );
          })}
        </section>
      )}

      {imagenSeleccionada && (
        <div className="gm-modal" onClick={() => setImagenSeleccionada(null)}>
          <div className="gm-modal-content">
            <img src={imagenSeleccionada} alt="Vista ampliada" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMantenimiento;
