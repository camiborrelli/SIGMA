import React, { useState } from "react";
import toast from "react-hot-toast";
import "./FinalizarMantenimientoModal.css";

const FinalizarMantenimientoModal = ({ unidad, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (!unidad?._id) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(
        `http://localhost:5001/unidades/mantenimiento/finalizar/${unidad._id}`,
        {
          method: "POST",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      
      if (!res.ok) throw new Error();
      
      toast.success("Mantenimiento finalizado");
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      toast.error("Error al finalizar mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fin-mantenimiento-overlay" onClick={onClose}>
      <div
        className="fin-mantenimiento-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="fin-mantenimiento-titulo">Finalizar mantenimiento</h2>
        <p className="fin-mantenimiento-desc">
          ¿Confirmar que el mantenimiento de{" "}
          <strong>{unidad?.identificador}</strong> está finalizado?
        </p>
        
        <div className="fin-mantenimiento-acciones">
          <button
            className="btn-fin-rojo"
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? "PROCESANDO..." : "CONFIRMAR"}
          </button>
          <button
            className="btn-fin-blanco"
            onClick={onClose}
            disabled={loading}
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizarMantenimientoModal;