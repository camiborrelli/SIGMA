import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroObra.css";
import toast from "react-hot-toast";

const RegistroObra = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activa");
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");

  const registrarObra = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMensaje("");
    setErrors({});

    if (
      !nombre ||
      !latitud ||
      !longitud ||
      !fechaInicio ||
      !fechaFin ||
      !descripcion
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("http://localhost:5001/obras", {
        method: "POST",
        headers,
        body: JSON.stringify({
          nombre,
          latitud,
          longitud,
          fechaInicio,
          fechaFin,
          descripcion,
          estado,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrors(result.errors || {});
        setMensaje(
          result.error || result.message || "Error al registrar la obra",
        );
        return;
      }

      toast.success("Obra registrada correctamente");
      // Limpiar todos los campos
      setNombre("");
      setLatitud("");
      setLongitud("");
      setFechaInicio("");
      setFechaFin("");
      setDescripcion("");
      setEstado("Activa");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al registrar la obra:", error);
      toast.error("Error de conexión al registrar la obra");
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
          placeholder="Latitud ej: -34.9011"
          value={latitud}
          onChange={(e) => setLatitud(e.target.value)}
          className={errors.latitud ? "input-error" : ""}
        />
        <input
          type="text"
          placeholder="Longitud ej: -58.3816"
          value={longitud}
          onChange={(e) => setLongitud(e.target.value)}
          className={errors.longitud ? "input-error" : ""}
        />
        <input
          type="text"
          placeholder="Fecha de inicio"
          value={fechaInicio}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
          }}
          onChange={(e) => setFechaInicio(e.target.value)}
          className={errors.fechaInicio ? "input-error" : ""}
        />
        <input
          type="text"
          placeholder="Fecha de fin"
          value={fechaFin}
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = "text";
          }}
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
          <option value="Activa">Activa</option>
          <option value="Finalizada">Finalizada</option>
          <option value="Cancelada">Cancelada</option>
        </select>

        <button type="submit" className="btn-primary">
          Registrar Obra
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default RegistroObra;
