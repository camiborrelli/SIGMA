import { useState } from "react";
import toast from "react-hot-toast";

const EditarEquipoModal = ({ equipo, onClose, onUpdated }) => {
  const [nombre, setNombre] = useState(equipo.nombre || "");
  const [modelo, setModelo] = useState(equipo.modelo || "");
  const [tipo, setTipo] = useState(equipo.tipo || "");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !modelo || !tipo) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/equipos/${equipo._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            nombre,
            modelo,
            tipo,
          }),
        }
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) throw new Error();

      toast.success("Equipo actualizado correctamente");
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar equipo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Editar equipo</h3>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Modelo"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
        />

        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Seleccione tipo</option>
          <option value="Maquina">Máquina</option>
          <option value="Herramienta">Herramienta</option>
        </select>

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

export default EditarEquipoModal;