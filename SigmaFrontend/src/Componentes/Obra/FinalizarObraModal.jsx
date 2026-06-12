import React, { useState } from "react";
import toast from "react-hot-toast";
import API_URL from ".../api";

const FinalizarObraModal = ({ obra, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const confirmarFinalizacion = async () => {
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
      `${API_URL}/obras/finalizar/${obraId}`,
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
      toast.error(body.error || "Error al finalizar la obra");
      return;
    }

    toast.success("Obra finalizada correctamente");
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
  const yaFinalizada = obra.estado === "Finalizada";

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Finalizar Obra</h2>

        {yaFinalizada ? (
          <p>
            La obra <strong>{obra.nombre}</strong> ya se encuentra finalizada.
          </p>
        ) : (
          <>
            <p>
              ¿Confirmas dar por finalizada la obra <strong>{obra.nombre}</strong>?
            </p>
            <p style={{ color: "red", marginTop: "10px" }}>
              ⚠️ Esta acción liberará automáticamente todas las unidades asignadas.
            </p>
          </>
        )}

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>

          {!yaFinalizada && (
            <button
              className="btn-asign"
              onClick={confirmarFinalizacion}
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

export default FinalizarObraModal;