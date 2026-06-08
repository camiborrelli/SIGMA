import React, { useState } from "react";
import "./AsignarMantenimientoUnidad.css";
import toast from "react-hot-toast";

const AsignarMantenimientoUnidad = ({ unidad, onClose, onUpdated }) => {
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formData = new FormData();
      if (foto) {
        formData.append("foto", foto); 
      }

      const res = await fetch(
        `http://localhost:5001/unidades/mantenimiento/${unidad._id}`,
        {
          method: "POST",
          headers,
          body: formData,
        }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Enviar a mantenimiento</h2>

        <p className="modal-subtitle">
          Unidad: <strong>{unidad?.identificador}</strong>
        </p>

        <p className="modal-description">Esta unidad dejará de estar disponible.</p>

        <div className="modal-input-container">
          <label htmlFor="input-foto" className="modal-file-dropzone">
            <span className="modal-file-icon">📷</span>
            <span className="modal-file-text">
              {foto ? `Seleccionado: ${foto.name}` : "Adjuntar foto del estado (opcional)"}
            </span>
          </label>
          <input
            id="input-foto"
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            className="modal-input-hidden"
          />
        </div>

        <div className="modal-actions">
          <button 
            className="btn-modal btn-secondary" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </button>

          <button 
            className="btn-modal btn-danger" 
            onClick={asignarMantenimiento} 
            disabled={loading}
          >
            {loading ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarMantenimientoUnidad;