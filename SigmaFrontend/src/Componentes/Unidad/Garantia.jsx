import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AsignarMantenimientoUnidad from "./AsignarMantenimientoUnidad";
import toast from "react-hot-toast";
import "./Garantia.css";
import { FaRegCalendarCheck } from "react-icons/fa";
import { FaRegCalendarXmark } from "react-icons/fa6";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { FaTools } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/es"; // para español
dayjs.locale("es");

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

  const formatDate = (date) => {
    if (!date) return "—";
    return dayjs(date).format("DD/MM/YYYY");
    console.log(date);
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) return;

      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const res = await fetch(
          `http://localhost:5001/unidades/garantia/${id}`,
          { headers },
        );
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          setError(r.error || "Error al obtener garantía");
        } else {
          const data = await res.json();
          setGarantia(data);
          setMaquinariaNombre(data.nombre || data.identificador || "Unidad");
          setMaquinaId(data._id);
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }

      // reparaciones
      try {
        const r2 = await fetch(
          `http://localhost:5001/unidades/${id}/reparaciones`,
          { headers },
        );
        if (r2.ok) {
          const d2 = await r2.json();
          setCantReparaciones(d2.cantReparaciones || 0);
        }
      } catch (err) {
        // no bloquear UI
      }
    };

    fetchAll();
  }, [id]);

  const porcentajeVidaUtil =
    garantia?.fechaCompra && garantia?.fechaFinGarantia
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (dayjs(garantia.fechaFinGarantia).diff(dayjs()) /
                dayjs(garantia.fechaFinGarantia).diff(
                  dayjs(garantia.fechaCompra),
                )) *
                100,
            ),
          ),
        )
      : 0;

  return (
    <div className="garantia-wrapper">
      {/* <h1 className="garantia-titulo">DETALLE DE UNIDAD</h1> */}
      <div className="garantia-body">
        {loading && <p>Cargando...</p>}
        {error && <p className="garantia-error">{error}</p>}

        {!loading && !error && !garantia && <p>No se encontraron datos.</p>}

        {garantia && (
          <>
            <div className="maquina-card">
              <div className="maquina-info">
                <h2 className="maquina-nombre">
                  DETALLE DE {maquinariaNombre}
                </h2>
                <p className="maquina-tipo">Estado: {garantia.estado}</p>
              </div>
            </div>
            {garantia.enGarantia && (
              <div className="vida-util-section">
                <span className="porcentaje-grande">{porcentajeVidaUtil}%</span>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${porcentajeVidaUtil}%` }}
                  />
                </div>
              </div>
            )}
            {garantia.enGarantia && (
              <div className="garantia-activa-banner">
                <div className="garantia-activa-check">
                  <IoCheckmarkDoneCircleOutline size={22} color="#fff" />
                </div>
                <div>
                  <h3 className="garantia-activa-titulo">GARANTÍA ACTIVA</h3>
                  <p className="garantia-activa-desc">
                    Su equipo está completamente cubierto bajo los términos del
                    fabricante.
                  </p>
                </div>
              </div>
            )}
            {!garantia.enGarantia && garantia.fechaCompra != null && (
              <div className="garantia-vencida-banner">
                <div className="garantia-vencida-icono">
                  <FaRegCalendarXmark size={42} color="#d2c8c8" />
                </div>
                <div>
                  <h3 className="garantia-vencida-titulo">GARANTÍA VENCIDA</h3>
                  <p className="garantia-vencida-desc">
                    La garantía de su equipo ha expirado. Considere opciones de
                    mantenimiento o renovación.
                  </p>
                </div>
              </div>
            )}
            {garantia.fechaCompra == null && (
              <div className="garantia-desconocida-banner">
                <div className="garantia-desconocida-icono">
                  <FaTools size={32} color="#d2c8c8" />
                </div>
                <div>
                  <h3 className="garantia-desconocida-titulo">
                    GARANTÍA DESCONOCIDA
                  </h3>
                  <p className="garantia-desconocida-desc">
                    No se pudo determinar el estado de la garantía. Por favor,
                    revise los datos de compra.
                  </p>
                </div>
              </div>
            )}

            <div className="fechas-section">
              <div className="fecha-card">
                <div className="fecha-icono">
                  <FaRegCalendarCheck color="#ef4444" />
                </div>
                <div>
                  <p className="fecha-label">Inicio de la garantía</p>
                  <p className="fecha-valor">
                    {formatDate(garantia.fechaCompra)}
                  </p>
                </div>
              </div>

              <div className="fecha-card">
                <div className="fecha-icono">
                  <FaRegCalendarXmark color="#ef4444" />
                </div>
                <div>
                  <p className="fecha-label">Vencimiento de la garantía</p>
                  <p className="fecha-valor">
                    {formatDate(garantia.fechaFinGarantia)}
                  </p>
                </div>
              </div>

              <div className="fecha-card">
                <div className="fecha-icono">
                  <FaTools />
                  {/* <IoCheckmarkDoneCircleOutline color="#10b981" /> */}
                </div>
                <div>
                  <p className="fecha-label">Reparaciones</p>
                  <p className="fecha-valor">{cantReparaciones}</p>
                </div>
              </div>

              {garantia.historialMantenimiento &&
                garantia.historialMantenimiento.length > 0 && (
                  <div className="historial-section">
                    <h3>Historial de mantenimiento</h3>
                    <ul className="historial-list">
                      {garantia.historialMantenimiento
                        .slice()
                        .reverse()
                        .map((h, idx) => (
                          <li key={idx} className="historial-item">
                            <div className="historial-left">
                              <p className="historial-usuario">
                                {h.usuario || "Usuario desconocido"}
                              </p>

                              <div className="historial-meta">
                                <span className="historial-fechas">
                                  {formatDate(h.fechaInicio)}
                                  {h.fechaFin
                                    ? ` — ${formatDate(h.fechaFin)}`
                                    : ""}
                                </span>

                                <span
                                  className={`historial-status ${
                                    h.fechaFin ? "finalizado" : "en-curso"
                                  }`}
                                >
                                  {h.fechaFin ? "Finalizado" : "En curso"}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          </>
        )}
      </div>
      <div className="garantia-acciones">
        <button
          className="btn-asign"
          onClick={() => {
            const est = String(garantia?.estado || "").toLowerCase();
            if (est.includes("mantenimiento")) {
              toast.error("La unidad ya está en mantenimiento.");
              return;
            }
            setShowModal(true);
          }}
        >
          ENVIAR A MANTENIMIENTO
        </button>

        <button className="btn-cancel" onClick={() => navigate(-1)}>
          CANCELAR
        </button>
      </div>

      {showModal && (
        <AsignarMantenimientoUnidad
          unidad={{
            _id: maquinaId,
            identificador: maquinariaNombre,
            estado: garantia?.estado,
          }}
          onClose={() => setShowModal(false)}
          onUpdated={async () => {
            // refrescar datos después de enviar a mantenimiento
            setShowModal(false);
            try {
              const token = localStorage.getItem("token");
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const res = await fetch(
                `http://localhost:5001/unidades/garantia/${maquinaId}`,
                { headers },
              );
              if (res.ok) {
                const data = await res.json();
                setGarantia(data);
                setMaquinariaNombre(
                  data.nombre || data.identificador || "Unidad",
                );
              }
              const r2 = await fetch(
                `http://localhost:5001/unidades/${maquinaId}/reparaciones`,
                { headers },
              );
              if (r2.ok) {
                const d2 = await r2.json();
                setCantReparaciones(d2.cantReparaciones || 0);
              }
            } catch (err) {
              // ignore
            }
          }}
        />
      )}
    </div>
  );
};

export default Garantia;
