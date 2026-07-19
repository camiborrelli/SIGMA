import React, { useState } from "react";
import toast from "react-hot-toast";
import "./ModalFechaMasiva.css";

const ModalFechaMasiva = ({ cantidad, onConfirm, onClose }) => {
  const [fecha, setFecha] = useState("");

  const confirmar = () => {
    if (!fecha) {
      toast.error("Seleccioná una fecha");
      return;
    }

    onConfirm(fecha);
  };

  return (
    <div className="modal-overlay modal-fecha-overlay" onClick={onClose}>
      <div
        className="modal-fecha-masiva"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-fecha-header">
          <h2>Agregar fecha de compra</h2>

          <button
            type="button"
            className="modal-fecha-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-fecha-info">
          <span className="modal-fecha-icon">📅</span>

          <p>
            Se aplicará a{" "}
            <strong>{cantidad}</strong>{" "}
            unidad{cantidad !== 1 ? "es" : ""} seleccionada
            {cantidad !== 1 ? "s" : ""}.
          </p>
        </div>

        <div className="modal-fecha-form">
          <label htmlFor="fecha-compra-masiva">
            Fecha de compra
          </label>

          <input
            id="fecha-compra-masiva"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="modal-fecha-actions">
          <button
            type="button"
            className="modal-fecha-btn cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="modal-fecha-btn confirmar"
            onClick={confirmar}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFechaMasiva;