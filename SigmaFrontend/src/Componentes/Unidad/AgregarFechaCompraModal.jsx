import React, { useState } from "react";
import toast from "react-hot-toast";

const AgregarFechaCompraModal = ({ unidad, onClose, onUpdated }) => {
  const [fechaCompra, setFechaCompra] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!fechaCompra) {
      toast.error("Debe ingresar una fecha");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/unidades/fecha-compra/${unidad._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fechaCompra }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Fecha de compra guardada");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar fecha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Agregar fecha de compra</h3>

        <p>
          Unidad: <strong>{unidad.identificador}</strong>
        </p>

        <input
          type="date"
          value={fechaCompra}
          onChange={(e) => setFechaCompra(e.target.value)}
        />

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn-asign"
            onClick={handleGuardar}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarFechaCompraModal;