import React, { useState } from "react";
import "./BajaUsuarioModal.css"; // Asegúrate de que el CSS tenga los nuevos nombres

const BajaUsuarioModal = ({ usuario, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !usuario) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(usuario._id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="baja-modal-overlay">
      <div className="baja-modal-card">
        <div className="baja-modal-header">
          <h2>Dar de baja usuario</h2>
          <button className="baja-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="baja-modal-body">
          <p>Estás a punto de dar de baja a:</p>
          <div className="baja-usuario-info">
            <p><strong>{usuario.nombre} {usuario.apellido} - {usuario.email}</strong></p>
          </div>
          <p className="baja-warning-text">
            Esta acción marcará al usuario como inactivo y no podrá acceder al sistema.
          </p>
        </div>

        <div className="baja-modal-footer">
          <button className="baja-btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="baja-btn-confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Dar de baja"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BajaUsuarioModal;