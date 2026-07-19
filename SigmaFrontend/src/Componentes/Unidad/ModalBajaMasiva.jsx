import React from "react";
import "./ModalBajaMasiva.css";

const ModalBajaMasiva = ({ cantidad, onConfirm, onClose }) => {
  return (
    <div className="modal-overlay modal-baja-masiva-overlay" onClick={onClose}>
      <div
        className="modal-baja-masiva"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-baja-masiva-header">
          <h2>Dar de baja unidades</h2>

          <button
            type="button"
            className="modal-baja-masiva-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-baja-masiva-warning">
          <span className="modal-baja-masiva-icon">⚠</span>

          <p>
            ¿Estás seguro de que querés dar de baja{" "}
            <strong>{cantidad}</strong> unidad
            {cantidad !== 1 ? "es" : ""}?
          </p>
        </div>

        <p className="modal-baja-masiva-description">
          Esta acción cambiará el estado de las unidades seleccionadas a{" "}
          <strong>Dada de Baja</strong>.
        </p>

        <div className="modal-baja-masiva-actions">
          <button
            type="button"
            className="modal-baja-btn cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="modal-baja-btn confirmar"
            onClick={onConfirm}
          >
            Confirmar baja
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalBajaMasiva;