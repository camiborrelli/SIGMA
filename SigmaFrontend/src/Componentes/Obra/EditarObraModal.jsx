import React, { useState } from "react";
import toast from "react-hot-toast";

const EditarObraModal = ({ obra, onClose, onUpdated }) => {
  const [nombre, setNombre] = useState(obra.nombre);
  const [estado, setEstado] = useState(obra.estado);
  const [descripcion, setDescripcion] = useState(obra.descripcion);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!nombre || nombre.trim() === "") {
      toast.error("El nombre de la obra no puede estar vacío");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5001/obras/editar/${obra._id || obra.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al editar obra");
      }

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      toast.success("Obra actualizada correctamente");
      if (onUpdated) onUpdated(data);
      onClose();
    } catch (error) {
      console.error("Error al editar obra:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500 }}
      >
        <h2>Cambiar el nombre de la obra</h2>
        <form onSubmit={handleSubmit} className="editar-obra-form">
          <label>Nuevo nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-guardar"
            disabled={loading}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "#eb2c25",
              color: "#fff",
              border: "none",
              borderRadius: 6,
            }}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarObraModal;
