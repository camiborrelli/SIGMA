import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import Garantia from "./Garantia";
import "./ListadoGeneral.css";
import Buscador from "../Usuario/Buscador";

const ListadoGeneral = () => {
  const [maquinaria, setMaquinaria] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [equiposMostrados, setEquiposMostrados] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(7);

  useEffect(() => {
    const actualizarItems = () => {
      const width = window.innerWidth;

      if (width <= 768) setItemsPorPagina(5);
      else if (width <= 1024) setItemsPorPagina(6);
      else setItemsPorPagina(7);
    };

    actualizarItems();
    window.addEventListener("resize", actualizarItems);

    return () => window.removeEventListener("resize", actualizarItems);
  }, []);

  const fetchMaquinaria = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch("http://localhost:5001/maquinaria", { headers });

      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        setError(r.error || "Error al obtener la maquinaria");
        setMaquinaria([]);
        setEquiposMostrados([]);
      } else {
        const data = await res.json();
        setMaquinaria(data || []);
        setEquiposMostrados(data || []);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (source = maquinaria, tipo = selectedTipo, term = searchTerm) => {
    const s = (term || "").toLowerCase();
    const out = source.filter((m) => {
      if (tipo && m.tipo !== tipo) return false;
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
    setPaginaActual(1);
  }, [equiposMostrados]);

  useEffect(() => {
    applyFilters(maquinaria, selectedTipo, searchTerm);
  }, [searchTerm, selectedTipo]);

  useEffect(() => {
    fetchMaquinaria();
  }, []);

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const equiposPaginados = equiposMostrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(equiposMostrados.length / itemsPorPagina);

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
            : "estado-mantenimiento";

        return <span className={`estado-badge ${cls}`}>{val}</span>;
      },
    },
    {
      header: "Obra Asignada",
      accessor: (row) => {
        const name =
          typeof row.ubicacion === "object"
            ? row.ubicacion?.nombre
            : row.ubicacion || "Sin asignar";

        return <div className="obra-text">{name}</div>;
      },
    },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          <button className="action-btn icon-edit">
            <span className="icon">✏️</span>
          </button>
          <button
            className="action-btn icon-key"
            onClick={() => navigate(`/garantia/${row._id}`)}
          >
            <span className="icon">🔑</span>
          </button>
          <button className="action-btn icon-delete">
            <span className="icon">🗑️</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="dashboard-card">
        <Buscador
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar equipo..."
        />

        <div className="filtros">
          <p>Filtrar:</p>

          <select value={selectedEstado}>
            <option value="">Todas</option>
          </select>

          <select value={selectedTipo}>
            <option value="">Tipos</option>
          </select>

          <p>Mostrando {equiposMostrados.length}</p>
        </div>
      </div>

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

                <p><strong>Tipo:</strong> {m.tipo}</p>
                <p><strong>Modelo:</strong> {m.modelo || "N/A"}</p>
                <p><strong>Stock:</strong> {m.stock || 0}</p>

                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`estado-badge ${
                      m.estado === "Disponible"
                        ? "estado-disponible"
                        : m.estado === "Asignada"
                        ? "estado-asignado"
                        : "estado-mantenimiento"
                    }`}
                  >
                    {m.estado || "Disponible"}
                  </span>
                </p>

                <p>
                  <strong>Obra:</strong>{" "}
                  {typeof m.ubicacion === "object"
                    ? m.ubicacion?.nombre
                    : m.ubicacion || "Sin asignar"}
                </p>

                <div className="actions">
                  <button className="action-btn icon-edit">✏️</button>
                  <button
                    className="action-btn icon-key"
                    onClick={() => navigate(`/garantia/${m._id}`)}
                  >
                    🔑
                  </button>
                  <button className="action-btn icon-delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="paginacion">
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ⬅
            </button>

            <span>
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoGeneral;