import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";
import "./RemoverUnidadesModal.css";

const RemoverUnidadesModal = ({ onClose, obra, onUpdated }) => {
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [removiendo, setRemoviendo] = useState(false);

  //listar equipos de la obra
  const fetchEquipos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/equipos/obra/${obra._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error("No se pudieron obtener los equipos de la obra");
      }

      const data = await res.json();
      setEquipos(data);

      if (data.length > 0) {
        setEquipoSeleccionado(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al obtener equipos");
    }
  };

  useEffect(() => {
    if (obra?._id) {
      fetchEquipos();
      console.log("Obra seleccionada:", obra);
    }
  }, [obra]);

  useEffect(() => {
    if (equipos.length > 0) {
      setEquipoSeleccionado(equipos[0].id);
      setCantidad("");
    }
  }, [equipos]);

  const equipoActual = equipos.find((e) => e.id === equipoSeleccionado);
  const stockDisponible = equipoActual?.stock;

  const handleRemover = async () => {
    if (!equipoSeleccionado) {
      toast.error("Seleccioná un equipo");
      return;
    }

    const cantidadNumero = Number(cantidad);

    if (!cantidadNumero || cantidadNumero < 1) {
      toast.error("Ingresá una cantidad válida");
      return;
    }

    if (cantidadNumero > stockDisponible) {
      toast.error(`Solo hay ${stockDisponible} unidades disponibles`);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      setRemoviendo(true);
      const res = await fetch(`${API_URL}/unidades/remover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          obraId: obra._id,
          equipoId: equipoSeleccionado,
          cantidad: cantidadNumero,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudieron remover las unidades");
      }

      toast.success("Unidades removidas correctamente");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al remover unidades");
    } finally {
      setRemoviendo(false);
    }
  };

  return (
    <div className="contenido-principal" onClick={onClose}>
      <div
        className="contenido-remover-unidades"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="header-remover-unidades">
          <h2>Remover unidades</h2>
          <p>
            Selecciona la cantidad de unidades que deseas quitar de la obra:{" "}
            {obra.nombre}
          </p>
        </div>

        <div className="remover-unidades-equipos">
          <p>Seleccionar equipo</p>
          <select
            name="equipo"
            value={equipoSeleccionado || ""}
            onChange={(e) => {
              setEquipoSeleccionado(e.target.value);
              setCantidad("");
            }}
          >
            {equipos.length > 0 ? (
              equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))
            ) : (
              <option disabled>No hay equipos</option>
            )}
          </select>
        </div>

        <div className="remover-unidades-stock">
          <p>Stock actual:</p>
          <p>{stockDisponible}</p>
        </div>
        <div className="remover-unidades-cantidades">
          <p>Cantidades a remover </p>
          <input
            type="number"
            min={1}
            max={stockDisponible}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <p>Max: {stockDisponible}</p>
        </div>
        <div className="remover-unidades-actions">
          <button
            type="button"
            className="remover-unidades-btn btn-cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="remover-unidades-btn btn-confirmar"
            onClick={handleRemover}
            disabled={removiendo}
          >
            {removiendo ? "Removiendo..." : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoverUnidadesModal;
