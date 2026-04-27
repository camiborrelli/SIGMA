import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Mantenimiento.css";

const AsignarMantenimiento = ({ id: propId, onClose }) => {
  const params = useParams();
  const paramId = params?.id;
  const id = propId || paramId;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [maquinaria, setMaquinaria] = useState(null);
  const [maquinariaNombre, setMaquinariaNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDetalle = async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`http://localhost:5001/maquinaria/${id}`, {
          headers,
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) setError(r.error || "Error al obtener maquinaria");
          return;
        }
        const data = await res.json();
        setMaquinariaNombre(data.maquinariaNombre || data.nombre || "");
        let item = null;
        if (Array.isArray(data)) {
          item = data.find((m) => m._id === id) || null;
        } else if (data && data._id) {
          item = data;
        }
        if (mounted) {
          setMaquinaria(item || null);
          setMaquinariaNombre(item?.nombre || "");
        }
      } catch (err) {
        if (mounted) setError("Error de conexión");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) fetchDetalle();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  const asignarMantenimiento = async () => {
    if (!id) return alert("ID de maquinaria no disponible");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `http://localhost:5001/maquinaria/mantenimiento/${id}`,
        {
          method: "POST",
          headers,
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return alert(body.error || "Error asignando a mantenimiento");
      }
      setMaquinaria(body);
      alert("Maquinaria asignada a mantenimiento");
      if (onClose) return onClose();
      navigate(-1);
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const obtenerGarantia = async (id) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `http://localhost:5001/maquinaria/garantia/${id}`,
        {
          headers,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data.error || "Error al obtener garantía");
      const msg = `Fecha compra: ${data.fechaCompra}\nFin garantía: ${data.fechaFinGarantia}\nEn garantía: ${data.enGarantia}\nDías restantes: ${data.diasRestantes}`;
      alert(msg);
    } catch (err) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-content">
          <h2>Asignar a Mantenimiento</h2>
          {error && <p className="error">{error}</p>}
          <h3 className="maquina-title">{maquinariaNombre}</h3>
          <p className="maquina-sub">
            Confirmas que deseas asignar este equipo a mantenimiento? El equipo
            quedará no disponible para obras.
          </p>
        </div>
        <div className="modal-footer">
          <div className="acciones">
            <button
              className="btn-cancel"
              onClick={() => {
                if (onClose) return onClose();
                navigate("/dashboard");
              }}
            >
              CANCELAR
            </button>
            <button className="btn-asign" onClick={asignarMantenimiento}>
              ENVIAR A MANTENIMIENTO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsignarMantenimiento;
