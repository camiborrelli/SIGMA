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
        // apply client-side search/tipo filter to initial data
        const initial = data || [];
        const filtered = initial.filter((m) => {
          if (selectedTipo && m.tipo !== selectedTipo) return false;
          if (!searchTerm) return true;
          const s = searchTerm.toLowerCase();
          const inNombre = (m.nombre || "").toLowerCase().includes(s);
          const inModelo = (m.modelo || "").toLowerCase().includes(s);
          const obra =
            m.ubicacion && typeof m.ubicacion === "object"
              ? m.ubicacion.nombre || ""
              : m.ubicacion || "";
          const inObra = (obra || "").toLowerCase().includes(s);
          return inNombre || inModelo || inObra;
        });
        setEquiposMostrados(filtered);
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
  source = maquinaria,
  tipo = selectedTipo,
  term = searchTerm,
  estado = selectedEstado
  ) => {
    const s = (term || "").toLowerCase();

    const out = source.filter((m) => {
      if (tipo && m.tipo !== tipo) return false;
      if (estado && m.estado !== estado) return false;

      if (!s) return true;
      const inNombre = (m.nombre || "").toLowerCase().includes(s);
      const inModelo = (m.modelo || "").toLowerCase().includes(s);
      const obra =
        m.ubicacion && typeof m.ubicacion === "object"
          ? m.ubicacion.nombre || ""
          : m.ubicacion || "";
      const inObra = (obra || "").toLowerCase().includes(s);
      const inTipo = (m.tipo || "").toLowerCase().includes(s);
      return inNombre || inModelo || inObra || inTipo;
    });
    setEquiposMostrados(out);
  };

  // `busqueda` is legacy from the top Buscador; keep it in sync with `searchTerm`
  useEffect(() => {
    if (busqueda !== searchTerm) setBusqueda(searchTerm);
  }, [searchTerm]);

  const maquinasDadosDeBaja = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch("http://localhost:5001/maquinaria/bajas", {
        headers,
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al obtener maquinaria");
        return [];
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);
      return data || [];
    } catch (err) {
      alert("Error de conexión");
      return [];
    }
  };

  const maquinasAsignadas = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch("http://localhost:5001/maquinaria/asignadas", {
        headers,
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al obtener maquinaria asignada");
        return [];
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);
      return data || [];
    } catch (err) {
      alert("Error de conexión");
      return [];
    }
  };

  const maquinasDisponibles = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch("http://localhost:5001/maquinaria/disponibles", {
        headers,
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al obtener maquinaria disponible");
        return [];
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);

      return data || [];
    } catch (err) {
      alert("Error de conexión");
      return [];
    }
  };

  const maquinasEnMantenimiento = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(
        "http://localhost:5001/maquinaria/mantenimiento",
        { headers },
      );
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al obtener maquinaria en mantenimiento");
        return [];
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);
      return data || [];
    } catch (err) {
      alert("Error de conexión");
      return [];
    }
  };

  const maquinasPorTipo = async (tipo) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(
        `http://localhost:5001/maquinaria/tipo/${tipo.toLowerCase()}`,
        { headers },
      );
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || `Error al obtener maquinaria tipo ${tipo}`);
        return [];
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);

      return data || [];
    } catch (err) {
      alert("Error de conexión");
      return [];
    }
  };

  useEffect(() => {
  applyFilters(maquinaria, selectedTipo, searchTerm, selectedEstado);
}, [maquinaria, searchTerm, selectedTipo, selectedEstado]);

  useEffect(() => {
    fetchMaquinaria();
  }, []);

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
              : "estado-mantenimiento";
        return <span className={`estado-badge ${cls}`}>{val}</span>;
      },
    },
    {
      header: "Obra Asignada",
      accessor: (row) => {
        const name =
          row.ubicacion && typeof row.ubicacion === "object"
            ? row.ubicacion.nombre
            : row.ubicacion || "Sin asignar";
        return <div className="obra-text">{name || "Sin asignar"}</div>;
      },
    },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          <button className="action-btn icon-edit" title="Editar">
            <span className="icon">✏️</span>
          </button>
          <button
            className="action-btn icon-key"
            title="Asignar a mantenimiento"
            onClick={() => navigate(`/garantia/${row._id}`)}
          >
            <span className="icon">🔑</span>
          </button>
          <button className="action-btn icon-delete" title="Dar de baja">
            <span className="icon">🗑️</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {" "}
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
              <option value="">Todas</option>
              <option value="Disponible">Disponibles</option>
              <option value="Asignada">Asignadas</option>
              <option value="En mantenimiento">En mantenimiento</option>
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
      <div className="dashboard-card">
        <div className="maquinaria-container">
          <h2>Listado de Maquinaria</h2>
          <div className="maquinaria-table">
            <Tabla columns={columns} data={equiposMostrados} />
          </div>
          <div className="mobile-cards">
            {equiposMostrados.map((m) => (
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
                          : "estado-mantenimiento"
                    }`}
                  >
                    {m.estado || "Disponible"}
                  </span>
                </p>
                <p>
                  <strong>Obra Asignada:</strong>{" "}
                  {m.ubicacion && typeof m.ubicacion === "object"
                    ? m.ubicacion.nombre
                    : m.ubicacion || "Sin asignar"}
                </p>
                <div className="actions">
                  <button className="action-btn icon-edit" title="Editar">
                    <span className="icon">✏️</span>
                  </button>
                  <button
                    className="action-btn icon-key"
                    title="Asignar a mantenimiento"
                    onClick={() => navigate(`/garantia/${m._id}`)}
                  >
                    <span className="icon">🔑</span>
                  </button>
                  <button
                    className="action-btn icon-delete"
                    title="Dar de baja"
                  >
                    <span className="icon">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoGeneral;
