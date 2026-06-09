import React, { useState, useEffect } from "react";
import "./ModalFiltros.css";
import { useNavigate } from "react-router-dom";

const ModalFiltros = ({ estadoFilter, setEstadoFilter }) => {
  const [estado, setEstado] = useState(estadoFilter || "");
  const [unidades, setUnidades] = useState([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);
  const navigate = useNavigate();

  console.log("Estado filter en ModalFiltros:", estadoFilter);

  const handleAplicarFiltros = () => {
    setTipoFilter(tipo);
    setEstadoFilter(estado);
  };

  const handleEstadoChange = (e) => {
    setEstadoFilter(e.target.value);
  };

  useEffect(() => {
    if (estadoFilter) {
      fetchUnidadesFiltradas();
    }
  }, [estadoFilter]);

  const cerrarModal = () => {
    setEstadoFilter("");
    navigate("/dashboard");
  };

  const fetchUnidadesFiltradas = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`http://localhost:5001/unidades`, {
        headers,
      });
      if (!res.ok) throw new Error("Error al obtener unidades");
      const data = await res.json();
      setUnidades(data || []);
    } catch (err) {
      console.error("Error unidades filtradas:", err);
    }
  };

  const normalizarEstado = (estado) => {
    if (!estado) return "";
    const v = estado.toLowerCase().trim();
    if (v.startsWith("mantenimiento")) return "En mantenimiento";
    if (v.includes("baja")) return "Dada de Baja";
    if (v.includes("asignada")) return "Asignada";
    if (v.includes("disponible")) return "Disponible";
    return estado; // fallback
  };

  const filtradas = unidades.filter((unidad) => {
    if (!estado) return true;
    return normalizarEstado(unidad.estado) === normalizarEstado(estado);
  });

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}
      >
        {unidades.length === 1 ? (
          <h2>Unidad {estadoFilter}</h2>
        ) : (
          <h2>Unidades {estadoFilter + "s"}</h2>
        )}
        {/* <p>Resultados encontrados: {filtradas.length}</p> */}
        <table>
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Equipo</th>
              <th>Estado</th>
              <th>Obra</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((unidad) => (
              <tr key={unidad.identificador}>
                <td>{unidad.identificador}</td>
                <td>{unidad.equipo?.nombre || "Sin equipo"}</td>

                <td>{unidad.estado}</td>
                <td>{unidad.ubicacion?.nombre || "Sin asignar"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => cerrarModal()} className="btn-cerrar-filtros">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalFiltros;
