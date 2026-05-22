import React, { useState } from "react";
import "./BajaUsuarioModal.css";

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
    <div className="modal-overlay">
      <div className="modal-content baja-modal">
        <div className="modal-header">
          <h2>Dar de baja usuario</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="warning-text">⚠️ Estás a punto de dar de baja a:</p>
          <div className="usuario-info">
            <p>
              <strong>
                {usuario.nombre} {usuario.apellido} - {usuario.email}
              </strong>
            </p>
          </div>
          <p className="warning-text">
            Esta acción marcará al usuario como inactivo y no podrá acceder al
            sistema.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn-confirm-baja"
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
