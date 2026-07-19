import React, { useState } from "react";
import "./registrar-form.css";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const RegistrarEquipo = ({ isOpen, onClose, onSuccess }) => {
const [nombre, setNombre] = useState("");
const [tipo, setTipo] = useState("");
const [modelo, setModelo] = useState("");
const [cantidad, setCantidad] = useState("");
const [mensaje, setMensaje] = useState("");

if (!isOpen) return null;

const handleSubmit = async (e) => {
e.preventDefault();
setMensaje("");

if (!nombre || !nombre.trim()) {
  toast.error("El nombre es obligatorio");
  return;
}

if (!tipo) {
  toast.error("Seleccioná el tipo de equipo");
  return;
}

if (!cantidad || Number(cantidad) < 1) {
  toast.error("La cantidad debe ser al menos 1");
  return;
}

const token = localStorage.getItem("token");

try {
  const res = await fetch(`${API_URL}/equipos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      nombre: nombre.trim(),
      tipo,
      modelo: modelo.trim(),
      cantidad: Number(cantidad),
    }),
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event("token-expirado"));
    throw new Error("Sesión expirada");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    toast.error(data.message || "Error al registrar equipo");
    return;
  }

  setNombre("");
  setTipo("");
  setModelo("");
  setCantidad("");
  setMensaje("");

  if (
    data.unidadesCreadas &&
    Array.isArray(data.unidadesCreadas)
  ) {
    const ids = data.unidadesCreadas
      .map((u) => u.identificador)
      .filter(Boolean)
      .join(", ");

    if (ids) {
      toast.success(`Equipo registrado. Unidades: ${ids}`);
    } else {
      toast.success("Equipo registrado correctamente");
    }
  } else {
    toast.success("Equipo registrado correctamente");
  }

  if (onSuccess) {
    onSuccess();
  }

  onClose();
} catch (err) {
  console.error("Error al registrar equipo:", err);

  if (err.message === "Sesión expirada") {
    return;
  }

  setMensaje("Error de conexión");
  toast.error("Error de conexión con el servidor");
}
};

return ( <div
   className="modal-overlay"
   onClick={onClose}
 >
<div
className="registrar-form"
onClick={(e) => e.stopPropagation()}
> <h2>Registrar Equipo</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          value={nombre}
          placeholder="Nombre del equipo"
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="form-group">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">
            Seleccionar el tipo
          </option>

          <option value="Maquina">
            Maquina
          </option>

          <option value="Herramienta">
            Herramienta
          </option>
        </select>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={modelo}
          placeholder="Modelo del equipo"
          onChange={(e) => setModelo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <input
          type="number"
          min="1"
          placeholder="Cantidad de unidades"
          value={cantidad}
          onChange={(e) => {
            const value = e.target.value;

            setCantidad(
              value === ""
                ? ""
                : Number(value),
            );
          }}
        />
      </div>

      <div className="buttons">
        <button
          type="submit"
          className="btn-primary"
        >
          Registrar Equipo
        </button>

        <button
          type="button"
          className="btn-cancel"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>

      {mensaje && (
        <p className="error">
          {mensaje}
        </p>
      )}
    </form>
  </div>
</div>
);
};

export default RegistrarEquipo;
