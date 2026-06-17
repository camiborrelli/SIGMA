import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { API_URL } from "../../../api";
import "./GestionMantenimiento.css";

const GestionMantenimiento = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState({});
  const [guardando, setGuardando] = useState({});
  const [historialAbierto, setHistorialAbierto] = useState({});

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

  return (
    <div className="gestion-mantenimiento">
      <div className="gm-header">
        <h1>Gestión de mantenimiento</h1>
        <span className="gm-count-pill">
          {unidades.length} unidad{unidades.length !== 1 ? "es" : ""} en
          mantenimiento
        </span>
      </div>

      {loading && <p className="gm-loading">Cargando...</p>}

      {!loading && unidades.length === 0 && (
        <p className="gm-empty">
          No hay unidades en mantenimiento actualmente.
        </p>
      )}

      {!loading && unidades.length > 0 && (
        <div className="gm-carousel">
          {unidades.map((unidad) => {
            const activa = getEntradaActiva(unidad);
            const dias = getDiasEnMantenimiento(activa?.fechaInicio);
            const fotoSrc = buildFotoSrc(activa?.foto);
            const historialPrevio = (
              unidad.historialMantenimiento || []
            ).filter((h) => h.fechaFin);
            const abierto = !!historialAbierto[unidad._id];

            return (
              <div key={unidad._id} className="gm-card">
                <h2>{unidad.nombre}</h2>
                <div className="gm-card-photo">
                  {fotoSrc ? (
                    <img
                      src={fotoSrc}
                      alt={`Estado de ${unidad.nombre}`}
                      onClick={() => window.open(fotoSrc, "_blank")}
                    />
                  ) : (
                    <i className="ti ti-photo-off" aria-hidden="true" />
                  )}
                </div>

                <div className="gm-card-body">
                  <p className="gm-card-title">{unidad.nombre}</p>
                  <p className="gm-card-sub">
                    {unidad.tipo} {unidad.modelo ? `· ${unidad.modelo}` : ""}
                  </p>

                  <div className="gm-meta-row">
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    {activa?.destino || "Lugar no especificado"}
                  </div>
                  <div className="gm-meta-row">
                    <i className="ti ti-user" aria-hidden="true" />
                    {activa?.usuario || "Responsable no especificado"}
                  </div>
                  <div className="gm-meta-row">
                    <i className="ti ti-calendar" aria-hidden="true" />
                    {activa?.fechaInicio
                      ? `Desde ${dayjs(activa.fechaInicio).format(
                          "DD/MM/YYYY",
                        )}`
                      : "Sin fecha de inicio"}
                  </div>
                  <div className="gm-meta-row">
                    <i className="ti ti-clock" aria-hidden="true" />
                    Cantidad de reparaciones: {unidad.cantidadReparaciones || 0}
                  </div>
                  <div className="gm-meta-row">
                    Garantía Activa: {unidad.garantia ? "Sí" : "No"}
                  </div>

                  {dias !== null && (
                    <span className="gm-days-badge">
                      <i className="ti ti-clock" aria-hidden="true" />
                      {dias} día{dias !== 1 ? "s" : ""}
                    </span>
                  )}

                  <div className="gm-divider" />

                  {activa?.comentarios && activa.comentarios.length > 0 && (
                    <ul className="gm-comentarios-activos">
                      {activa.comentarios.map((c, idx) => (
                        <li key={idx} className="gm-comentario-item">
                          <span className="gm-comentario-texto">{c.texto}</span>
                          <span className="gm-comentario-fecha">
                            {dayjs(c.fecha).format("DD/MM HH:mm")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <textarea
                    placeholder="Agregar comentario..."
                    value={comentarios[unidad._id] || ""}
                    onChange={(e) =>
                      handleComentarioChange(unidad._id, e.target.value)
                    }
                  />
                  <button
                    className="gm-btn-comment"
                    onClick={() => guardarComentario(unidad)}
                    disabled={guardando[unidad._id]}
                  >
                    {guardando[unidad._id]
                      ? "Guardando..."
                      : "Guardar comentario"}
                  </button>

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
                                <span className="gm-history-fechas">
                                  {dayjs(h.fechaInicio).format("DD/MM/YYYY")} —{" "}
                                  {dayjs(h.fechaFin).format("DD/MM/YYYY")}
                                </span>
                                {h.destino && (
                                  <span className="gm-history-lugar">
                                    {h.destino}
                                  </span>
                                )}
                                {h.comentarios && h.comentarios.length > 0 && (
                                  <span className="gm-history-comentario">
                                    {h.comentarios
                                      .map((c) => c.texto)
                                      .join(" · ")}
                                  </span>
                                )}
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
      )}
    </div>
  );
};

export default GestionMantenimiento;
