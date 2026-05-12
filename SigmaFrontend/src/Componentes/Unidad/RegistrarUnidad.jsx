import React, { useState, useEffect } from "react";
import "../Equipo/registrar-form.css";
import { useNavigate, useLocation } from "react-router-dom";

const RegistrarUnidad = () => {
  const [equipoId, setEquipoId] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [equipos, setEquipos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // if navigation provided an equipoId in state, preselect it
    if (location && location.state && location.state.equipoId) {
      setEquipoId(location.state.equipoId);
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
  }, []);

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
      const res = await fetch(
        `http://localhost:5001/unidades/agregar/${equipoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            identificador,
            fechaCompra,
          }),
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return setMensaje(data.error || "Error al crear unidad");
      }

      alert("Unidad creada correctamente");

      setEquipoId("");
      setIdentificador("");
      setFechaCompra("");
    } catch (err) {
      setMensaje("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrar-form">
      <h2>Registrar Unidad</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Equipo</label>
          <select
            value={equipoId}
            onChange={(e) => setEquipoId(e.target.value)}
          >
            <option value="">Seleccionar equipo</option>

            {equipos.map((equipo) => (
              <option key={equipo._id} value={equipo._id}>
                {equipo.nombre} {equipo.modelo ? `(${equipo.modelo})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Identificador</label>
          <input
            type="text"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            placeholder="Ej: EXC-001"
          />
        </div>

        <div className="form-group">
          <label>Fecha de compra</label>
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
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </button>
        </div>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </form>
    </div>
  );
};

export default RegistrarUnidad;
