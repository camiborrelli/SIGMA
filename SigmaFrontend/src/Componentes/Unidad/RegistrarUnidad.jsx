import React, { useState, useEffect } from "react";
import "../Equipo/registrar-form.css";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const RegistrarUnidad = ({ isOpen, onClose, onSuccess, initialEquipoId }) => {
  const [equipoId, setEquipoId] = useState("");
  const [placeholderIdentificador, setPlaceholderIdentificador] =
    useState("Ej: EQ-XXXXXX-1");
  const [unidadesCount, setUnidadesCount] = useState(0);
  const [fechaCompra, setFechaCompra] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [equipos, setEquipos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const equipoSeleccionado = equipos.find(
    (eq) => String(eq._id || eq.id) === String(equipoId),
  );
  const esLote = equipoSeleccionado?.modoGestion === "lote";

  useEffect(() => {
    if (!isOpen) return;

    if (initialEquipoId) {
      setEquipoId(initialEquipoId);
    } else {
      setEquipoId("");
    }

    const cargarEquipos = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/equipos`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json().catch(() => []);

        if (res.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
          throw new Error("Sesión expirada");
        }
        if (res.ok) {
          setEquipos(Array.isArray(data) ? data : []);
        } else {
          setEquipos([]);
        }
      } catch (err) {
        setEquipos([]);
      }
    };

    cargarEquipos();
  }, [isOpen, initialEquipoId]);

  useEffect(() => {
    if (!isOpen || !equipoId) {
      setPlaceholderIdentificador("Ej: EQ-XXXXXX-1");
      setUnidadesCount(0);
      return;
    }

    const fetchUnidades = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/unidades/equipo/${equipoId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = await res.json().catch(() => []);
        const count = Array.isArray(data) ? data.length : 0;
        setUnidadesCount(count);

        const equipoObj = equipos.find(
          (eq) => String(eq._id || eq.id) === String(equipoId),
        );

        const codigoEquipo =
          equipoObj && equipoObj.codigo ? equipoObj.codigo : "EQ-XXXXXX";
        const nextNum = count + 1;

        setPlaceholderIdentificador(
          equipoObj?.modoGestion === "lote"
            ? `${codigoEquipo}-L${nextNum}`
            : `${codigoEquipo}-${nextNum}`,
        );
      } catch (err) {
        setUnidadesCount(0);
        setPlaceholderIdentificador("Ej: EQ-XXXXXX-1");
      }
    };

    fetchUnidades();
  }, [equipoId, equipos, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!equipoId) {
      setMensaje("Debes seleccionar un equipo");
      setLoading(false);
      return;
    }

    if (esLote && (!cantidad || Number(cantidad) < 1)) {
      setMensaje("La cantidad del lote debe ser al menos 1");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/unidades/agregar/${equipoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          fechaCompra,
          ...(esLote ? { cantidad: Number(cantidad) } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoading(false);
        return setMensaje(data.error || "Error al crear unidad");
      }

      toast.success("Unidad registrada correctamente");

      setEquipoId("");
      setFechaCompra("");
      setCantidad("");
      setMensaje("");

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setMensaje("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="registrar-form" onClick={(e) => e.stopPropagation()}>
        <h2>Registrar Unidad</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              Equipo
            </label>
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map((equipo) => (
                <option
                  key={equipo._id || equipo.id}
                  value={equipo._id || equipo.id}
                >
                  {equipo.nombre} {equipo.modelo ? `(${equipo.modelo})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              Identificador
            </label>
            <input
              type="text"
              value={equipoId ? placeholderIdentificador : ""}
              readOnly
              disabled
              placeholder="Selecciona un equipo primero"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#64748b",
                cursor: "not-allowed",
              }}
            />
          </div>

          <div className="form-group">
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#475569",
              }}
            >
              Fecha de compra
            </label>
            <input
              type="date"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
            />
          </div>

          {esLote && (
            <div className="form-group">
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#475569",
                }}
              >
                Cantidad del lote
              </label>
              <input
                type="number"
                min={1}
                value={cantidad}
                placeholder="Cantidad de unidades"
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
          )}

          <div className="buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Unidad"}
            </button>

            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>

          {mensaje && <p className="error">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegistrarUnidad;
