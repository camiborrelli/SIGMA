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
  const [ubicacion, setUbicacion] = useState("");
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");

  const registrarObra = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMensaje("");
    setErrors({});

    if (
      !nombre ||
      !ubicacion ||
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
          latitud = await getLatitudYLongitud(ubicacion)?.latitud || latitud,
          longitud = await getLatitudYLongitud(ubicacion)?.longitud || longitud,
          ubicacion,
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
      setUbicacion("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al registrar la obra:", error);
      toast.error("Error de conexión al registrar la obra");
    }
  };

  const getLatitudYLongitud = async (direccion) => {
    try {
      const API_KEY = "TU_API_KEY";

      const res = await fetch(
        `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
          direccion,
        )}&type=search&api_key=${API_KEY}`,
      );

      if (!res.ok) return null;

      const data = await res.json();

      const place = data.local_results?.[0];

      if (!place) return null;

      return {
        latitud: place.gps_coordinates?.latitude,
        longitud: place.gps_coordinates?.longitude,
      };
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
      return null;
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
        {/* <input
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
        /> */}
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
