import React, { useState } from "react";
import toast from "react-hot-toast";
const ModalFechaMasiva = ({ cantidad, onConfirm, onClose }) => {
  const [fecha, setFecha] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}
      >
        <h2>Agregar fecha de compra</h2>
        <p style={{ margin: "8px 0 16px", color: "#64748b", fontSize: 14 }}>
          Se aplicará a <strong>{cantidad}</strong> unidad
          {cantidad !== 1 ? "es" : ""} seleccionada{cantidad !== 1 ? "s" : ""}.
        </p>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e8e8e8",
            fontSize: 14,
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-aplicar-masiva"
            style={{ flex: 1 }}
            onClick={() => {
              if (!fecha) {
                toast.error("Seleccioná una fecha");
                return;
              }
              onConfirm(fecha);
            }}
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e8e8e8",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFechaMasiva;
