import React, { useEffect, useState } from "react";
import "./Mantenimiento.css";

const AsignarMantenimientoUnidad = ({ unidad, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");

  const asignarMantenimiento = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(
        `http://localhost:5001/unidades/mantenimiento/${unidad._id}`,
        {
          method: "POST",
          headers,
        }
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return alert(body.error || "Error asignando a mantenimiento");
      }

      alert("Unidad enviada a mantenimiento");

      onUpdated();
      onClose();
    } catch {
      alert("Error de conexión");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Enviar a mantenimiento</h2>

        <p>
          Unidad: <strong>{unidad.identificador}</strong>
        </p>

        <p>
          Esta unidad dejará de estar disponible.
        </p>

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
