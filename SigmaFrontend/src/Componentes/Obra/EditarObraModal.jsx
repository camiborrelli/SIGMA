import React, { useState } from "react";
import toast from "react-hot-toast";
import "./EditarObraModal.css";

const EditarObraModal = ({ obra, onClose, onUpdated }) => {
  const [nombre, setNombre] = useState(obra.nombre);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5001/obras/editar/${obra._id || obra.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) throw new Error("Error al editar obra");
      const data = await res.json();
      toast.success("Obra actualizada correctamente");
      onUpdated(data);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <h2>Cambiar el nombre de la obra</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="editar-obra-form">
          <label>Nuevo nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel-edit" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-confirm-edit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarObraModal;