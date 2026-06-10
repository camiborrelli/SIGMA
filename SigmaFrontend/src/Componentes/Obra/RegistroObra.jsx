import { useState } from "react";
import "../Equipo/registrar-form.css";
import toast from "react-hot-toast";

const RegistroObra = ({ isOpen, onClose, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activa");
  const [ubicacion, setUbicacion] = useState("");
  const [errors, setErrors] = useState({});
  const [geocodingStatus, setGeocodingStatus] = useState("");

  if (!isOpen) return null;

  const geocodificar = async () => {
    if (!ubicacion.trim()) return;

    setGeocodingStatus("🔍 Buscando coordenadas...");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          ubicacion
        )}&format=json&limit=1&countrycodes=uy`,
        {
          headers: {
            "Accept-Language": "es",
            "User-Agent": "SIGMA-App/1.0",
          },
        }
      );
      const data = await res.json();

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!data || data.length === 0) {
        setLatitud("");
        setLongitud("");
        setGeocodingStatus("⚠️ No se encontró la dirección, verificá el texto");
        return;
      }

      setLatitud(parseFloat(data[0].lat));
      setLongitud(parseFloat(data[0].lon));
      setGeocodingStatus(`✅ ${data[0].display_name}`);
    } catch (err) {
      setGeocodingStatus("❌ Error al buscar coordenadas");
    }
  };

  const registrarObra = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrors({});

    if (!nombre || !ubicacion) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!latitud || !longitud) {
      toast.error("No se pudieron obtener las coordenadas de la dirección");
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
          ubicacion,
          latitud,
          longitud,
          fechaInicio: fechaInicio || null,
          fechaFin: fechaFin || null, 
          estado,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setErrors(result.errors || {});
        toast.error(result.error || result.message || "Error al registrar la obra");
        return;
      }

      toast.success("Obra registrada correctamente");

      setNombre("");
      setLatitud("");
      setLongitud("");
      setFechaInicio("");
      setFechaFin("");
      setDescripcion("");
      setEstado("Activa");
      setUbicacion("");
      setGeocodingStatus("");

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al registrar la obra:", error);
      toast.error("Error de conexión al registrar la obra");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="registrar-form" onClick={(e) => e.stopPropagation()}>
        <h2>Registro de Obra</h2>
        
        <form onSubmit={registrarObra}>
          {Object.keys(errors).length > 0 && (
            <p className="error">Por favor completa todos los campos</p>
          )}
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre de la obra (obligatorio)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={errors.nombre ? "input-error" : ""}
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Ubicación (ej: Av. 18 de Julio 1234, Montevideo) (obligatorio)"
              value={ubicacion}
              onChange={(e) => {
                setUbicacion(e.target.value);
                setLatitud(""); 
                setLongitud("");
                setGeocodingStatus("");
              }}
              onBlur={geocodificar}
              className={errors.ubicacion ? "input-error" : ""}
            />
            {geocodingStatus && (
              <small style={{ color: geocodingStatus.startsWith("✅") ? "green" : "orange", paddingLeft: "4px", fontSize: "12px" }}>
                {geocodingStatus}
              </small>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Fecha de inicio (YYYY-MM-DD)"
              value={fechaInicio}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Fecha fin estimada (YYYY-MM-DD)"
              value={fechaFin}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div className="buttons">
            <button type="submit" className="btn-primary">
              Registrar Obra
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroObra;