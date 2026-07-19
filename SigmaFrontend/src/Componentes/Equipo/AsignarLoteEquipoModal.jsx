import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const AsignarLoteEquipoModal = ({ equipo, onClose, onUpdated }) => {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  const equipoId = equipo?._id || equipo?.id;
  const disponible = Number(equipo?.disponible || 0);

  useEffect(() => {
    setCantidad(disponible > 0 ? String(disponible) : "");
  }, [disponible]);

  useEffect(() => {
    const cargarObras = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${API_URL}/obras`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
          throw new Error("Sesion expirada");
        }

        if (!res.ok) throw new Error("Error al obtener obras");

        const data = await res.json();
        setObras(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar las obras");
      }
    };

    cargarObras();
  }, []);

  const asignarLote = async (e) => {
    e.preventDefault();

    if (!obraId) {
      toast.error("Debe seleccionar una obra");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (
      !Number.isFinite(cantidadNumerica) ||
      cantidadNumerica < 1 ||
      cantidadNumerica > disponible
    ) {
      toast.error(`La cantidad debe estar entre 1 y ${disponible}`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/unidades/asignar-lote/${equipoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          obraId,
          cantidad: Math.trunc(cantidadNumerica),
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesion expirada");
      }

      if (!res.ok) {
        toast.error(body.error || "Error al asignar lote");
        return;
      }

      toast.success(
        `Se asignaron ${body.cantidadAsignada || Math.trunc(cantidadNumerica)} unidades`,
      );

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lote-modal-overlay" onClick={onClose}>
      <form
        className="lote-modal-card"
        onSubmit={asignarLote}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Asignar lote</h2>

        <div className="lote-modal-summary">
          <strong>{equipo?.nombre}</strong>
          <span>{disponible} unidades disponibles</span>
        </div>

        <label>
          Cantidad
          <input
            type="number"
            min={1}
            max={disponible}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Cantidad a asignar"
          />
        </label>

        <label>
          Obra
          <select value={obraId} onChange={(e) => setObraId(e.target.value)}>
            <option value="">Seleccionar obra</option>
            {obras.map((obra) => (
              <option key={obra._id} value={obra._id}>
                {obra.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="lote-modal-actions">
          <button type="button" className="btn-lote-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-lote-submit"
            disabled={loading || disponible < 1}
          >
            {loading ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsignarLoteEquipoModal;
