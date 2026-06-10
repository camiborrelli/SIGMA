import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCcw, FiX, FiCheck } from "react-icons/fi";
import "./ReactivarObraModal.css";

const ReactivarObraModal = ({ obra, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  if (!obra) return null;

  const confirmarReactivacion = async () => {
    try {
      setLoading(true);
      const obraId = obra._id || obra.id;

      if (!obraId) {
        toast.error("Error: No se pudo localizar el ID de la obra");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(
        `http://localhost:5001/obras/reactivar/${obraId}`,
        {
          method: "PATCH",
          headers,
        }
      );

      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) {
        toast.error(body.error || "Error al reactivar la obra");
        return;
      }

      toast.success("Obra reactivada correctamente");
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

  const yaActiva = obra.estado === "Activa";

  return (
    <div className="reactivar-modal-overlay">
      <div className="reactivar-modal-card">

        <div className="reactivar-modal-icon-badge">
          <FiRefreshCcw className="icon-spin-reverse" />
        </div>

        <h2>Reactivar Obra</h2>

        {yaActiva ? (
          <p className="reactivar-modal-desc">
            La obra <strong className="txt-highlight-red">{obra.nombre}</strong> ya se encuentra activa.
          </p>
        ) : (
          <>
            <p className="reactivar-modal-desc">
              ¿Confirmas que deseas reactivar la obra <strong className="txt-highlight-red">{obra.nombre}</strong>?
            </p>

            <div className="reactivar-modal-alert-box">
              <div className="alert-box-icon">
                <FiRefreshCcw />
              </div>
              <p>
                La obra pasará a estado <strong className="txt-highlight-green">'Activa'</strong> y volverá a mostrarse en el mapa operacional.
              </p>
            </div>
          </>
        )}

        <div className="reactivar-modal-actions">
          <button className="btn-reactivar-cancel" onClick={onClose} disabled={loading}>
            <FiX /> CANCELAR
          </button>

          {!yaActiva && (
            <button
              className="btn-reactivar-confirm"
              onClick={confirmarReactivacion}
              disabled={loading}
            >
              {loading ? (
                "PROCESANDO..."
              ) : (
                <>
                  <FiCheck /> CONFIRMAR
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReactivarObraModal;