import React, { useState, useEffect } from "react";
import "./RegistrarMaquinaria.css";
import { useNavigate } from "react-router-dom";

const RegistrarMaquinaria = () => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [modelo, setModelo] = useState("");
  const [estado, setEstado] = useState("Disponible");
  const [stock, setStock] = useState(0);
  const [fechaCompra, setFechaCompra] = useState("");
  const [obraId, setObraId] = useState("");
  const [errors, setErrors] = useState({});

  const [obras, setObras] = useState([]);

  const listaObras = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5001/obras", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setObras([]);
        return;
      }
      setObras(Array.isArray(data) ? data : []);
    } catch (err) {
      setObras([]);
    }
  };

  useEffect(() => {
    listaObras();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5001/maquinaria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          nombre,
          tipo,
          modelo,
          estado,
          stock,
          fechaCompra,
          obraId,
        }),
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al registrar maquinaria");
      } else {
        alert("Maquinaria registrada correctamente");
        setNombre("");
        setTipo("");
        setModelo("");
        setEstado("Disponible");
        setStock(0);
        setFechaCompra("");
        setObraId("");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const navigate = useNavigate();

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="registrar-maquinaria">
          <h2>Registrar Nueva Maquinaria</h2>
          <form onSubmit={handleSubmit}>
            <div className="div">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  erromessage="El nombre es requerido"
                />
              </div>
              <div className="form-group">
                <label>Modelo:</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  erromessage="El modelo es requerido"
                />
              </div>
            </div>

            <div className="div">
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  name="tipo"
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  erromessage="El tipo es requerido"
                >
                  <option value="">Seleccionar Tipo</option>
                  <option value="Maquina">Maquina</option>
                  <option value="Herramienta">Herramienta</option>
                </select>
              </div>

              {/* <div className="form-group">
                <label>Estado:</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  erromessage="El estado es requerido"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Asignada">Asignada</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div> */}
            </div>

            <div className="div">
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value))}
                  erromessage="El stock es requerido y debe ser un número"
                />
              </div>
              <div className="form-group">
                <label>Fecha de Compra:</label>
                <input
                  type="date"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  erromessage="La fecha de compra es requerida"
                />
              </div>
              <div className="form-group">
                <label>Obra:</label>
                <select
                  name="obras"
                  id=""
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                >
                  <option value="">Seleccionar Obra</option>
                  {obras.map((obra, idx) => (
                    <option
                      key={obra._id || obra.id || idx}
                      value={obra._id || obra.id || ""}
                    >
                      {obra.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="buttons">
              <button type="submit" className="btn btn-registrar">
                Registrar Maquinaria
              </button>{" "}
              <button
                type="button"
                className="btn btn-cancelar"
                onClick={() => {
                  setNombre("");
                  setTipo("");
                  setModelo("");
                  setEstado("Disponible");
                  setStock(0);
                  setFechaCompra("");
                  setObraId("");
                  navigate("/dashboard");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarMaquinaria;
