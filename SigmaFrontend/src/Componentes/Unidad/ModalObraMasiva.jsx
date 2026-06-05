import React, { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";

const ModalObraMasiva = ({ cantidad, onConfirm, onClose }) => {
  const [obraId, setObraId] = useState("");
  const [obras, setObras] = useState([]);

  useEffect(() => {
    const fetchObras = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/obras", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Error al obtener obras");

        const data = await res.json();
        setObras(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar las obras");
      }
    };

    fetchObras();
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}
      >
        <h2>Asignar a obra</h2>
        <p style={{ margin: "8px 0 16px", color: "#64748b", fontSize: 14 }}>
          Se aplicará a <strong>{cantidad}</strong> unidad
          {cantidad !== 1 ? "es" : ""} seleccionada{cantidad !== 1 ? "s" : ""}.
        </p>
        <select
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e8e8e8",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          <option value="">-- Seleccioná una obra --</option>
          {obras.map((obra) => (
            <option key={obra._id} value={obra._id}>
              {obra.nombre}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-aplicar-masiva"
            style={{ flex: 1 }}
            onClick={() => {
              if (!obraId) {
                toast.error("Seleccioná una obra");
                return;
              }
              onConfirm(obraId);
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

export default ModalObraMasiva;
