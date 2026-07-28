import React, { useState, useEffect } from "react";
import "./ModalFiltros.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../api";

const ModalFiltros = ({ estadoFilter, setEstadoFilter }) => {
  const [estado, setEstado] = useState(estadoFilter || "");
  const [unidades, setUnidades] = useState([]);
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(6);
  const [cargandoUnidades, setCargandoUnidades] = useState(false);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setPorPagina(5); // Mobile
      } else if (width <= 1024) {
        setPorPagina(6); // Tablet
      } else {
        setPorPagina(7); // Desktop
      }
    };

    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);
    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  useEffect(() => {
    if (estadoFilter) {
      fetchUnidadesFiltradas();
    }
  }, [estadoFilter]);

  useEffect(() => {
    setPaginaActual(1);
  }, [estadoFilter, porPagina]);

  const cerrarModal = () => {
    setEstadoFilter("");
    navigate("/dashboard");
  };

  const fetchUnidadesFiltradas = async () => {
    setCargandoUnidades(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/unidades`, {
        headers,
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) throw new Error("Error al obtener unidades");
      const data = await res.json();
      setUnidades(data || []);
    } catch (err) {
      console.error("Error unidades filtradas:", err);
    } finally {
      setCargandoUnidades(false);
    }
  };

  const normalizarEstado = (estado) => {
    if (!estado) return "";
    const v = estado.toLowerCase().trim();
    if (v.startsWith("mantenimiento")) return "En mantenimiento";
    if (v.includes("baja")) return "Dada de Baja";
    if (v.includes("asignada")) return "Asignada";
    if (v.includes("disponible")) return "Disponible";
    return estado;
  };

  const equiposFiltrados = unidades.filter((unidad) => {
    if (!estado) return true;
    return normalizarEstado(unidad.estado) === normalizarEstado(estado);
  });

  const totalPaginas = Math.ceil(equiposFiltrados.length / porPagina) || 1;
  const indiceInicio = (paginaActual - 1) * porPagina;
  const indiceFin = indiceInicio + porPagina;
  const unidadesPaginadas = equiposFiltrados.slice(indiceInicio, indiceFin);

  return (
    <div className="modal-filtros-overlay" onClick={cerrarModal}>
      <div
        className="modal-filtros-content"
        onClick={(e) => e.stopPropagation()}
      >
        {equiposFiltrados.length === 1 ? (
          <h2>Unidad {estadoFilter}</h2>
        ) : estadoFilter == "Disponible" ? (
          <h2>Unidades Disponibles</h2>
        ) : estadoFilter == "Asignada" ? (
          <h2>Unidades Asignadas</h2>
        ) : estadoFilter == "Mantenimiento" ? (
          <h2>Unidades en Mantenimiento</h2>
        ) : estadoFilter == "De Baja" ? (
          <h2>Unidades Dadas de Baja</h2>
        ) : (
          <h2>Unidades {estadoFilter + "s"}</h2>
        )}

        <table className="table-filtros">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Equipo</th>
              <th>Estado</th>
              <th>Obra</th>
            </tr>
          </thead>
          <tbody>
            {cargandoUnidades ? (
              <tr>
                <td
                  colSpan="4"
                  className="cargando-acciones"
                  style={{ textAlign: "center" }}
                >
                  <div
                    className="gm-loader"
                    style={{ margin: "0 auto 14px" }}
                  ></div>
                  Cargando unidades...
                </td>
              </tr>
            ) : null}
            {unidadesPaginadas.map((unidad) => (
              <tr key={unidad.identificador}>
                <td>{unidad.identificador}</td>
                <td>{unidad.equipo?.nombre || "Sin equipo"}</td>
                {estadoFilter === "Disponible" && (
                  <td>
                    <div className="estado-disponible">{unidad.estado}</div>
                  </td>
                )}
                {estadoFilter === "Asignada" && (
                  <td>
                    <div className="estado-asignado">{unidad.estado}</div>
                  </td>
                )}
                {estadoFilter === "Mantenimiento" && (
                  <td>
                    <div className="estado-mantenimiento">{unidad.estado}</div>
                  </td>
                )}
                {estadoFilter === "De Baja" && (
                  <td>
                    <div className="estado-baja">{unidad.estado}</div>
                  </td>
                )}
                <td>{unidad.ubicacion?.nombre || "Sin asignar"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="paginacion-filtros">
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              ⬅
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              ➡
            </button>
          </div>
        )}

        <button onClick={cerrarModal} className="btn-cerrar-filtros">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalFiltros;
