import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaTag, FaTimes } from "react-icons/fa";
import "./EditarEtiquetaModal.css";

const EditarDescripcionModal = ({ unidad, onClose, onUpdated }) => {
  const [descripcion, setDescripcion] = useState(unidad.descripcion || "");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/unidades/descripcion/${unidad._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ descripcion }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      toast.success("Descripción actualizada");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error("No se pudo actualizar la descripción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="etiqueta-modal-overlay" onClick={onClose}>
      <div className="etiqueta-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="etiqueta-modal-header">
          <h2>Editar descripción</h2>
          <button className="close-icon-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="etiqueta-modal-body">
          <div className="unidad-id-box">
            <FaTag className="tag-icon" />
            <span>Unidad: <strong>{unidad.identificador}</strong></span>
          </div>

          <div className="form-group">
            <label htmlFor="desc-input">Descripción</label>
            <textarea
              id="desc-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe una descripción para esta unidad..."
              rows={4}
            />
          </div>
        </div>

        <div className="etiqueta-acciones">
          <button className="btn-etiqueta-cancel" onClick={onClose}>Cancelar</button>
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

export default EditarDescripcionModal;