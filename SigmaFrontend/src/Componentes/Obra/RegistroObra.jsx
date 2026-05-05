import { use } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroObra.css";

const RegistroObra = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("En planificación");

  const registrarObra = async (e) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5001/obras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          nombre,
          ubicacion,
          fechaInicio,
          fechaFin,
          descripcion,
          estado,
        }),
      });
    } catch (error) {
      console.error("Error al registrar la obra:", error);
    }
  };

  useEffect(() => {
    registrarObra();
  }, []);

  return (
    <div className="obra-content">
      <h2>Registro de Obra</h2>
      <form onSubmit={registrarObra} className="registrar-obra">
        <input
          type="text"
          placeholder="Nombre de la obra"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ubicación"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha de inicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha de fin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="En planificación">En planificación</option>
          <option value="En ejecución">En ejecución</option>
          {/* <option value="Finalizada">Finalizada</option> */}
        </select>
        <button type="submit">Registrar Obra</button>
        <button type="button" className="cancel" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default RegistroObra;
