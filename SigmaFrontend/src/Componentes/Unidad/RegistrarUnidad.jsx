import React, { useState, useEffect } from "react";
import "../Equipo/registrar-form.css";
import { useNavigate, useLocation } from "react-router-dom";

const RegistrarUnidad = () => {
  const [equipoId, setEquipoId] = useState("");
  const [identificador, setIdentificador] = useState("");
  const [placeholderIdentificador, setPlaceholderIdentificador] =
    useState("Ej: EXC-001");
  const [unidadesCount, setUnidadesCount] = useState(0);
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

  // cuando cambia el equipo seleccionado, obtener cantidad de unidades para sugerir identificador
  useEffect(() => {
    if (!equipoId) {
      setPlaceholderIdentificador("Ej: EXC-001");
      setUnidadesCount(0);
      return;
    }

    const fetchUnidades = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:5001/unidades/equipo/${equipoId}`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } },
        );
        const data = await res.json().catch(() => []);
        const count = Array.isArray(data) ? data.length : 0;
        setUnidadesCount(count);

        // construir prefijo desde el nombre del equipo si está disponible
        const equipoObj = equipos.find(
          (eq) => String(eq._id) === String(equipoId),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoId, equipos]);

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
      // si el usuario dejó el identificador vacío, usar el placeholder sugerido
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
            placeholder={placeholderIdentificador}
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
