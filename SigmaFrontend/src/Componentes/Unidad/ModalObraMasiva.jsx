import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const ModalObraMasiva = ({ cantidad, onConfirm, onClose }) => {
  const [obraId, setObraId] = useState("");
  const [obras, setObras] = useState([]);

  useEffect(() => {
    const fetchObras = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/obras`, {
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

  const confirmar = () => {
    if (!obraId) {
      toast.error("Selecciona una obra");
      return;
    }

    onConfirm(obraId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-obra-masiva-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Asignar a obra</h2>
        <p className="modal-obra-masiva-texto">
          Se aplicara a <strong>{cantidad}</strong> unidad
          {cantidad !== 1 ? "es" : ""} seleccionada
          {cantidad !== 1 ? "s" : ""}.
        </p>

        <select
          className="modal-obra-masiva-select"
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
        >
          <option value="">-- Selecciona una obra --</option>
          {obras.map((obra) => (
            <option key={obra._id} value={obra._id}>
              {obra.nombre}
            </option>
          ))}
        </select>

        <div className="modal-obra-masiva-acciones">
          <button
            type="button"
            className="modal-obra-masiva-confirmar"
            onClick={confirmar}
          >
            Confirmar
          </button>
          <button
            type="button"
            className="modal-obra-masiva-cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalObraMasiva;
