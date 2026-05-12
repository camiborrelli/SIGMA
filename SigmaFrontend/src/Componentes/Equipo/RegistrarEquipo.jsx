import React, { useState } from "react";
import "./registrar-form.css";
import { useNavigate } from "react-router-dom";

const RegistrarEquipo = () => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [modelo, setModelo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          nombre,
          tipo,
          modelo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return setMensaje(data.error || "Error al registrar equipo");
      }

      alert("Equipo registrado correctamente");

      setNombre("");
      setTipo("");
      setModelo("");
    } catch (err) {
      setMensaje("Error de conexión");
    }
  };

  return (
    <div className="registrar-form">
      <h2>Registrar Equipo</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            value={nombre}
            placeholder="Nombre del equipo"
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Seleccionar el tipo</option>
            <option value="computadora">Maquina</option>
            <option value="impresora">Herramienta</option>
          </select>
        </div>

        <div className="form-group">
          <input
            value={modelo}
            placeholder="Modelo del equipo"
            onChange={(e) => setModelo(e.target.value)}
          />
        </div>

        <div className="buttons">
          <button type="submit" className="btn-primary">
            Registrar Equipo
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </button>
        </div>

        {mensaje && <p className="error">{mensaje}</p>}
      </form>
    </div>
  );
};

export default RegistrarEquipo;
