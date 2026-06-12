import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTag, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./EditarEtiquetaModal.css";
import API_URL from ".../api";

const EditarEtiquetaModal = ({ unidad, onClose, onUpdated }) => {
  const [etiqueta, setEtiqueta] = useState(unidad.etiqueta);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleGuardar = async () => {
    if (!etiqueta || etiqueta === "") {
        toast.error("Por favor, ingresa un número de etiqueta.");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/unidades/etiqueta/${unidad._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ etiqueta: Number(etiqueta) }),
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("Etiqueta actualizada");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error("No se pudo actualizar la etiqueta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="etiqueta-modal-overlay" onClick={onClose}>
      <div className="etiqueta-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="etiqueta-modal-header">
          <h2>Editar etiqueta</h2>
          <button className="close-icon-btn" onClick={onClose} title="Cerrar">
            <FaTimes />
          </button>
        </div>

        <div className="etiqueta-modal-body">
          <div className="unidad-id-box">
            <FaTag className="tag-icon" />
            <span>Unidad: <strong>{unidad.identificador}</strong></span>
          </div>

          <div className="form-group">
            <label htmlFor="etiqueta-input">Etiqueta</label>
            <input
              id="etiqueta-input"
              type="number"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="Ej: 123"
            />
          </div>

          <div className="etiqueta-info-box">
            <FaInfoCircle className="info-icon" />
            <p>
              Las etiquetas ayudan a identificar y organizar tus unidades de
              forma más eficiente.
            </p>
          </div>
        </div>

        <div className="etiqueta-acciones">
          <button className="btn-etiqueta-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-etiqueta-confirm" 
            onClick={handleGuardar}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarEtiquetaModal;