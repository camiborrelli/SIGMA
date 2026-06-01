import React, { useState, useEffect } from "react";
import "../Equipo/registrar-form.css"; 
import toast from "react-hot-toast";

const RegistrarUnidad = ({ isOpen, onClose, onSuccess, initialEquipoId }) => {
  const [equipoId, setEquipoId] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [placeholderIdentificador, setPlaceholderIdentificador] = useState("Ej: EXC-001");
  const [unidadesCount, setUnidadesCount] = useState(0);
  const [fechaCompra, setFechaCompra] = useState("");
  const [equipos, setEquipos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

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
        const res = await fetch("http://localhost:5001/equipos", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json().catch(() => []);

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
      setPlaceholderIdentificador("Ej: EXC-001");
      setUnidadesCount(0);
      return;
    }

    const fetchUnidades = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:5001/unidades/equipo/${equipoId}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        const data = await res.json().catch(() => []);
        const count = Array.isArray(data) ? data.length : 0;
        setUnidadesCount(count);

        const equipoObj = equipos.find(
          (eq) => String(eq._id || eq.id) === String(equipoId)
        );
        const nombre =
          equipoObj && equipoObj.nombre
            ? String(equipoObj.nombre).split(/\s+/)[0]
            : "UN";
        const nextNum = count + 1;
        setPlaceholderIdentificador(`${nombre.toUpperCase()}-${nextNum}`);
      } catch (err) {
        setUnidadesCount(0);
        setPlaceholderIdentificador("Ej: EXC-001");
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

    try {
      const finalIdentificador =
        identificador && String(identificador).trim()
          ? identificador
          : placeholderIdentificador;

      const res = await fetch(
        `http://localhost:5001/unidades/agregar/${equipoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            identificador: finalIdentificador,
            fechaCompra,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLoading(false);
        return setMensaje(data.error || "Error al crear unidad");
      }

      toast.success("Unidad registrada correctamente");

      setEquipoId("");
      setIdentificador("");
      setFechaCompra("");
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
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Equipo</label>
            <select
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map((equipo) => (
                <option key={equipo._id || equipo.id} value={equipo._id || equipo.id}>
                  {equipo.nombre} {equipo.modelo ? `(${equipo.modelo})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Identificador</label>
            <input
              type="text"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder={placeholderIdentificador}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "600", color: "#475569" }}>Fecha de compra</label>
            <input
              type="date"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
            />
          </div>

          <div className="buttons">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Unidad"}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
            >
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