import React from "react";
import "./Mantenimiento.css";
import toast from "react-hot-toast";

const AsignarMantenimientoUnidad = ({ unidad, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");

  const asignarMantenimiento = async () => {
    if (!unidad || !unidad._id) return;

    const est = String(unidad.estado || "").toLowerCase();
    if (est.includes("baja") || est === "dada de baja") {
      toast.error("La unidad está dada de baja.");
      return;
    }
    if (est.includes("mantenimiento")) {
      toast.error("La unidad ya está en mantenimiento.");
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(
        `http://localhost:5001/unidades/mantenimiento/${unidad._id}`,
        {
          method: "POST",
          headers,
        },
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(body.error || "Error asignando a mantenimiento");
        return;
      }

      toast.success("Unidad enviada a mantenimiento");

      if (onUpdated) onUpdated();
      if (onClose) onClose();
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Enviar a mantenimiento</h2>

        <p>
          Unidad: <strong>{unidad?.identificador}</strong>
        </p>

        <p>Esta unidad dejará de estar disponible.</p>

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn-asign" onClick={asignarMantenimiento}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarMantenimientoUnidad;
