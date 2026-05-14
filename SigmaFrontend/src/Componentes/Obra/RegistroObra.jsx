import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroObra.css";
import toast from "react-hot-toast";

const RegistroObra = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("En planificación");
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");

  const registrarObra = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMensaje("");
    setErrors({});
    const token = localStorage.getItem("token");
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("http://localhost:5001/obras", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nombre,
          ubicacion,
          fechaInicio,
          fechaFin,
          descripcion,
          estado,
        }),
      });
      const result = await res.json();

      if (!nombre || !ubicacion || !fechaInicio || !descripcion) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }
      if (!res.ok) {
        setErrors(result.errors || {});
        setMensaje(
          result.error || result.message || "Error al registrar la obra",
        );
        return;
      } else {
        toast.success("Obra registrada correctamente");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error al registrar la obra:", error);
    }
  };

  return (
    <div className="obra-content">
      <h2>Registro de Obra</h2>
      <form onSubmit={registrarObra} className="registrar-obra">
        {Object.keys(errors).length > 0 && (
          <p className="error">Por favor completa todos los campos</p>
        )}
        <input
          type="text"
          placeholder="Nombre de la obra"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={errors.nombre ? "input-error" : ""}
        />
        <input
          type="text"
          placeholder="Ubicación"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          className={errors.ubicacion ? "input-error" : ""}
        />
        <input
          type="date"
          placeholder="Fecha de inicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className={errors.fechaInicio ? "input-error" : ""}
        />
        <input
          type="date"
          placeholder="Fecha de fin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className={errors.fechaFin ? "input-error" : ""}
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={errors.descripcion ? "input-error" : ""}
        />

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className={errors.estado ? "input-error" : ""}
        >
          <option value="En planificación">En planificación</option>
          <option value="En ejecución">En ejecución</option>
          {/* <option value="Finalizada">Finalizada</option> */}
        </select>

        <button type="submit" className="btn-primary">Registrar Obra</button>
        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default RegistroObra;
