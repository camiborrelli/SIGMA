import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const AsignarUnidadModal = ({ unidad, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");
  const [ubicacion, setUbicacion] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const res = await fetch(`${API_URL}/obras`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Error al obtener obras");

        const data = await res.json();
        setUbicaciones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar las obras");
      }
    };

    fetchObras();

    if (unidad?.ubicacion) {
      setUbicacion(
        typeof unidad.ubicacion === "object"
          ? unidad.ubicacion._id
          : unidad.ubicacion,
      );
    } else {
      setUbicacion("");
    }
  }, [unidad, token]);

  const asignar = async () => {
    if (!ubicacion) {
      toast.error("Debe seleccionar una obra");
      return;
    }

    try {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_URL}/unidades/asignar/${unidad._id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ ubicacion }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(body.error || "Error al asignar unidad");
        return;
      }

      toast.success("Unidad asignada correctamente");

      onUpdated();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay unidad-child-modal-overlay">
      <div className="modal-card unidad-child-modal-card">
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

        <div className="acciones">
          <button className="btn-cancel unidad-modal-action-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-asign unidad-modal-action-btn"
            onClick={asignar}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarUnidadModal;
