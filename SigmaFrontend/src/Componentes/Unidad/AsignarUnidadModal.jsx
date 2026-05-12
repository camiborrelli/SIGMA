import React, { useEffect, useState } from "react";

const AsignarUnidadModal = ({ unidad, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");
  const [ubicacion, setUbicacion] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const res = await fetch("http://localhost:5001/obras", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Error al obtener obras");

        const data = await res.json();
        setUbicaciones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setUbicaciones([]);
        setMensaje("Error al cargar las obras");
        setTipoMensaje("error");
      }
    };

    fetchObras();

    if (unidad?.ubicacion) {
      setUbicacion(
        typeof unidad.ubicacion === "object"
          ? unidad.ubicacion._id
          : unidad.ubicacion
      );
    } else {
      setUbicacion("");
    }
  }, [unidad, token]);

  const asignar = async () => {
    if (!ubicacion) {
      setMensaje("Debe seleccionar una obra");
      setTipoMensaje("error");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const res = await fetch(
        `http://localhost:5001/unidades/asignar/${unidad._id}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ ubicacion }),
        }
      );

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMensaje(body.error || "Error al asignar unidad");
        setTipoMensaje("error");
        return;
      }

      setMensaje("Unidad asignada correctamente");
      setTipoMensaje("exito");

      onUpdated();
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión");
      setTipoMensaje("error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Asignar Unidad</h2>

        <p>
          Unidad: <strong>{unidad.identificador}</strong>
        </p>

        <label>Obra</label>
        <select
          value={ubicacion || ""}
          onChange={(e) => setUbicacion(e.target.value)}
        >
          <option value="">Sin asignar</option>
          {ubicaciones.map((u) => (
            <option key={u._id} value={u._id}>
              {u.nombre}
            </option>
          ))}
        </select>

        {mensaje && (
          <p
            style={{
              color: tipoMensaje === "error" ? "#dc2626" : "#16a34a",
              marginTop: "8px",
              fontWeight: "500",
            }}
          >
            {mensaje}
          </p>
        )}

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-asign" onClick={asignar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarUnidadModal;