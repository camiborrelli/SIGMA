import React, { useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const BajaUnidadModal = ({ unidad, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const darDeBaja = async () => {
    try {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_URL}/unidades/baja/${unidad._id}`, {
        method: "POST",
        headers,
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) {
        toast.error(body.error || "Error al dar de baja");
        return;
      }

      toast.success("Unidad dada de baja");

      onUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const yaBaja = unidad.estado === "Dada de Baja";

  return (
    <div className="modal-overlay unidad-child-modal-overlay">
      <div className="modal-card unidad-child-modal-card">
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
