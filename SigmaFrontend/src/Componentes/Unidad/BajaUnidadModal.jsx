import React, { useState } from "react";

const BajaUnidadModal = ({ unidad, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const darDeBaja = async () => {
    try {
      setLoading(true);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(
        `http://localhost:5001/unidades/baja/${unidad._id}`,
        {
          method: "POST",
          headers,
        },
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(body.error || "Error al dar de baja");
      }

      alert("Unidad dada de baja");

      onUpdated();
      s;
      onClose();
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const yaBaja = unidad.estado === "Dada de Baja";

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Dar de baja unidad</h2>

        {yaBaja ? (
          <p>
            La unidad <strong>{unidad.identificador}</strong> ya está dada de
            baja.
          </p>
        ) : (
          <p>
            ¿Confirmas dar de baja la unidad{" "}
            <strong>{unidad.identificador}</strong>?
          </p>
        )}

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          {!yaBaja && (
            <button
              className="btn-asign"
              onClick={darDeBaja}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Confirmar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BajaUnidadModal;
