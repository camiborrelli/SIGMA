import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Garantia.css";

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
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    let mounted = true;

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const obtenerGarantia = async () => {
      if (!id) return;

      setLoading(true);

      try {
        const res = await fetch(
          `http://localhost:5001/unidades/garantia/${id}`,
          { headers }
        );

        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) setError(r.error || "Error al obtener garantía");
          return;
        }

        const data = await res.json();

        if (mounted) {
          setGarantia(data);

          setMaquinariaNombre(data.identificador || "Unidad");

          setMaquinaId(data._id);
        }
      } catch {
        if (mounted) setError("Error de conexión");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const obtenerReparaciones = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/unidades/${id}/reparaciones`,
          { headers }
        );

        if (!res.ok) {
          return;
        }

        const data = await res.json();

        if (mounted) {
          setCantReparaciones(data.cantReparaciones || 0);
        }
      } catch {
        //no bloquea UI
      }
    };

    obtenerGarantia();
    obtenerReparaciones();

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
              100
          )
        )
      )
    : 0;

  return (
    <div className="garantia-wrapper">
      <h1 className="garantia-titulo">DETALLE DE UNIDAD</h1>

      <div className="garantia-body">
        {loading && <p>Cargando...</p>}
        {error && <p className="garantia-error">{error}</p>}

        {!loading && !error && !garantia && (
          <p>No se encontraron datos.</p>
        )}

        {garantia && (
          <>
            <div className="maquina-card">
              <div className="maquina-info">
                <h2 className="maquina-nombre">{maquinariaNombre}</h2>
                <p className="maquina-tipo">
                  Estado: {garantia.estado}
                </p>
              </div>
            </div>

            <div className="vida-util-section">
              <span className="porcentaje-grande">
                {porcentajeVidaUtil}%
              </span>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${porcentajeVidaUtil}%` }}
                />
              </div>
            </div>

            <div className="fechas-section">
              <p>
                Inicio: {formatDate(garantia.fechaCompra)}
              </p>
              <p>
                Reparaciones: {cantReparaciones}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="garantia-acciones">
        <button
          className="btn-asign"
          onClick={() => setShowModal(true)}
        >
          ENVIAR A MANTENIMIENTO
        </button>

        <button
          className="btn-cancel"
          onClick={() => navigate(-1)}
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
};

export default Garantia;