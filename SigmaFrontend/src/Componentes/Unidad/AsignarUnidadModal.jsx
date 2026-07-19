import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const AsignarUnidadModal = ({ unidad, equipo, onClose, onUpdated }) => {
  const token = localStorage.getItem("token");
  const [ubicacion, setUbicacion] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cantidadAsignar, setCantidadAsignar] = useState("1");
  const [loading, setLoading] = useState(false);

  const cantidadDisponible = Number(unidad?.cantidad || 1);
  const modoGestion =
    equipo?.modoGestion ||
    (unidad?.equipo && typeof unidad.equipo === "object"
      ? unidad.equipo.modoGestion
      : "");
  const esLote = modoGestion === "lote" || cantidadDisponible > 1;

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

    setCantidadAsignar(String(Number(unidad?.cantidad || 1)));
  }, [unidad, token]);

  const asignar = async () => {
    if (!ubicacion) {
      toast.error("Debe seleccionar una obra");
      return;
    }

    const cantidadNumerica = Number(cantidadAsignar);
    if (
      esLote &&
      (!Number.isFinite(cantidadNumerica) ||
        cantidadNumerica < 1 ||
        cantidadNumerica > cantidadDisponible)
    ) {
      toast.error(`La cantidad debe estar entre 1 y ${cantidadDisponible}`);
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
        body: JSON.stringify({
          ubicacion,
          ...(esLote ? { cantidad: Math.trunc(cantidadNumerica) } : {}),
        }),
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
        <h2>{esLote ? "Asignar Lote" : "Asignar Unidad"}</h2>

        <p>
          {esLote ? "Lote" : "Unidad"}:{" "}
          <strong>{unidad.identificador}</strong>
        </p>

        {esLote && (
          <div className="form-group">
            <label>Cantidad a asignar</label>
            <input
              type="number"
              min={1}
              max={cantidadDisponible}
              value={cantidadAsignar}
              onChange={(e) => setCantidadAsignar(e.target.value)}
            />
            <small style={{ color: "#64748b" }}>
              Disponible en este lote: {cantidadDisponible}
            </small>
          </div>
        )}

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
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-asign" onClick={asignar} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsignarUnidadModal;
