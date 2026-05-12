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
    <div className="registrar-maquinaria">
      <h2>Registrar Equipo</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Tipo</label>
          <input value={tipo} onChange={(e) => setTipo(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Modelo</label>
          <input value={modelo} onChange={(e) => setModelo(e.target.value)} />
        </div>

        <div className="buttons">
          <button type="submit">Registrar Equipo</button>
          <button type="button" className="btn-cancelar" onClick={() => navigate("/dashboard")}>
            Cancelar
          </button>
        </div>

        {mensaje && <p className="error">{mensaje}</p>}
      </form>
    </div>
  );
};

export default RegistrarEquipo;