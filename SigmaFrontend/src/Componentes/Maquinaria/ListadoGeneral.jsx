import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import "../Maquinaria/ListadoGeneral.css";
import Buscador from "../Usuario/Buscador";
import "../Maquinaria/BajaEquipo";

const ListadoGeneral = () => {
  const [maquinaria, setMaquinaria] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [equiposMostrados, setEquiposMostrados] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(7);
  const [confirmBaja, setConfirmBaja] = useState(null);

  const fetchMaquinaria = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await fetch("http://localhost:5001/maquinaria", { headers });

      if (!res.ok) {
        setError("Error al obtener la maquinaria");
        setMaquinaria([]);
        setEquiposMostrados([]);
      } else {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        setMaquinaria(lista);
        setEquiposMostrados(lista);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    source = maquinaria,
    tipo = selectedTipo,
    term = searchTerm,
    estado = selectedEstado,
  ) => {
    if (!Array.isArray(source)) return;

    const s = (term || "").toLowerCase();

    const out = source.filter((m) => {
      if (tipo && m.tipo !== tipo) return false;
      if (estado && m.estado !== estado) return false;

      if (!s) return true;

      const obra =
        typeof m.ubicacion === "object"
          ? m.ubicacion?.nombre || ""
          : m.ubicacion || "";

      return (
        m.nombre?.toLowerCase().includes(s) ||
        m.modelo?.toLowerCase().includes(s) ||
        obra.toLowerCase().includes(s) ||
        m.tipo?.toLowerCase().includes(s)
      );
    });

    setEquiposMostrados(out);
  };

  useEffect(() => {
    applyFilters(maquinaria, selectedTipo, searchTerm, selectedEstado);
  }, [maquinaria, searchTerm, selectedTipo, selectedEstado]);

  useEffect(() => {
    fetchMaquinaria();
  }, []);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        setItemsPorPagina(5); //mobile
      } else if (width <= 1024) {
        setItemsPorPagina(6); //tablet
      } else {
        setItemsPorPagina(7); //desktop
      }
    };

    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);

    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  const darDeBaja = async (id) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const equipo = maquinaria.find((m) => m._id === id);
    if (equipo?.estado === "Dada de Baja") {
      return (
        <div className="baja-container">
          <h2>El equipo {equipo.nombre} ya se encuentra dado de baja.</h2>
          <div className="actions">
            <button
              className="btn-cancelar"
              onClick={() => navigate("/listadoGeneral")}
            >
              Volver
            </button>
          </div>
        </div>
      );
    }

    try {
      const res = await fetch(`http://localhost:5001/maquinaria/baja/${id}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Error al dar de baja");
        return;
      }
      await fetchMaquinaria();
    } catch (error) {
      console.error("Error al dar de baja:", error);
      setError("Error al dar de baja");
    }
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [equiposMostrados]);

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const equiposPaginados = equiposMostrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(equiposMostrados.length / itemsPorPagina);

  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value);
  };

  const handleTipoChange = (e) => {
    setSelectedTipo(e.target.value);
  };

  const columns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Tipo", accessor: "tipo" },
    { header: "Modelo", accessor: "modelo" },
    { header: "Stock", accessor: "stock" },
    {
      header: "Estado",
      accessor: (row) => {
        const val = row.estado || "Disponible";
        const cls =
          val === "Disponible"
            ? "estado-disponible"
            : val === "Asignada"
              ? "estado-asignado"
              : val === "En mantenimiento"
                ? "estado-mantenimiento"
                : val === "Dada de Baja"
                  ? "estado-baja"
                  : "";

        return <span className={`estado-badge ${cls}`}>{val}</span>;
      },
    },
    {
      header: "Obra Asignada",
      accessor: (row) => {
        const name =
          row.ubicacion && typeof row.ubicacion === "object"
            ? row.ubicacion?.nombre || "Sin asignar"
            : row.ubicacion || "Sin asignar";
        return <div className="obra-text">{name}</div>;
      },
    },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          <button className="action-btn icon-edit">✏️</button>
          <button
            className="action-btn icon-key"
            onClick={() => navigate(`/garantia/${row._id}`)}
          >
            🔑
          </button>
          <button
            className="action-btn icon-delete"
            onClick={() => {
              if (row.estado === "Dada de Baja") {
                setConfirmBaja({ already: true, nombre: row.nombre });
              } else {
                setConfirmBaja({ id: row._id, nombre: row.nombre });
              }
            }}
          >
            <span className="icon">🚫</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="dashboard-card">
        <div className="top-controls">
          <Buscador
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar equipo..."
          />

          <div className="filtros">
            <p>Filtrar:</p>

            <select value={selectedEstado} onChange={handleEstadoChange}>
              <option value="">Estados</option>
              <option value="Disponible">Disponibles</option>
              <option value="Asignada">Asignadas</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="Dada de Baja">Dada de Baja</option>
            </select>

            <select value={selectedTipo} onChange={handleTipoChange}>
              <option value="">Tipos</option>
              <option value="Maquina">Maquina</option>
              <option value="Herramienta">Herramienta</option>
            </select>

            <p>Mostrando {equiposMostrados.length}</p>
          </div>
        </div>
      </div>

      {confirmBaja && (
        <div className="confirm-banner">
          {confirmBaja.already ? (
            <>
              <p className="p1">
                El equipo <strong>{confirmBaja.nombre}</strong> ya está dado de
                baja.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmBaja(null)}
                >
                  Cerrar
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="p2">
                ¿Confirmar dar de baja el equipo{" "}
                <strong>{confirmBaja.nombre}</strong>?
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-confirm"
                  onClick={async () => {
                    await darDeBaja(confirmBaja.id);
                    setConfirmBaja(null);
                  }}
                >
                  Confirmar
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setConfirmBaja(null)}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="dashboard-card">
        <div className="maquinaria-container">
          <h2>Listado de Maquinaria</h2>

          <div className="maquinaria-table">
            <Tabla columns={columns} data={equiposPaginados} />
          </div>

          <div className="mobile-cards">
            {equiposPaginados.map((m) => (
              <div key={m._id} className="maquinaria-card">
                <h3>{m.nombre}</h3>
                <p>
                  <strong>Tipo:</strong> {m.tipo}
                </p>
                <p>
                  <strong>Modelo:</strong> {m.modelo || "N/A"}
                </p>
                <p>
                  <strong>Stock:</strong> {m.stock || 0}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`estado-badge ${
                      m.estado === "Disponible"
                        ? "estado-disponible"
                        : m.estado === "Asignada"
                          ? "estado-asignado"
                          : m.estado === "En mantenimiento"
                            ? "estado-mantenimiento"
                            : m.estado === "Dada de Baja"
                              ? "estado-baja"
                              : ""
                    }`}
                  >
                    {m.estado || "Disponible"}
                  </span>
                </p>

                <p>
                  <strong>Obra:</strong>{" "}
                  {typeof m.ubicacion === "object"
                    ? m.ubicacion?.nombre
                    : "Sin asignar"}
                </p>

                <div className="actions">
                  <button className="action-btn icon-edit">✏️</button>
                  <button
                    className="action-btn icon-key"
                    onClick={() => navigate(`/garantia/${m._id}`)}
                  >
                    🔑
                  </button>
                  <button
                    className="action-btn icon-delete"
                    onClick={() =>
                      setConfirmBaja({ id: m._id, nombre: m.nombre })
                    }
                  >
                    <span className="icon">🚫</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion">
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
        </div>
      </div>
    </div>
  );
};

export default ListadoGeneral;
