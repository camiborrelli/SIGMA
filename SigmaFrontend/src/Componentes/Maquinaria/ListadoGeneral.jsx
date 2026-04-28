import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import Garantia from "./Garantia";
import "./ListadoGeneral.css";

const ListadoGeneral = () => {
  const [maquinaria, setMaquinaria] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [equiposMostrados, setEquiposMostrados] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

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

  const handleEstadoChange = async (e) => {
    const val = e.target.value;
    setSelectedEstado(val);
    if (!val) return fetchMaquinaria();
    switch (val) {
      case "Disponibles":
        await maquinasDisponibles();
        break;
      case "Asignadas":
        await maquinasAsignadas();
        break;
      case "Mantenimiento":
        await maquinasEnMantenimiento();
        break;
      case "Baja":
        await maquinasDadosDeBaja();
        break;
      default:
        await fetchMaquinaria();
    }
  };

  const handleTipoChange = async (e) => {
    const val = e.target.value;
    setSelectedTipo(val);
    if (!val) return fetchMaquinaria();
    // call backend type route
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`http://localhost:5001/maquinaria/tipo/${val}`, {
        headers,
      });
      if (!res.ok) {
        const r = await res.json().catch(() => ({}));
        alert(r.error || "Error al obtener maquinarias por tipo");
        return;
      }
      const data = await res.json();
      setMaquinaria(data || []);
      setEquiposMostrados(data || []);
    } catch (err) {
      alert("Error de conexión");
    }
  };

  useEffect(() => {
    fetchMaquinaria();
  }, []);

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
        <div className="filtros">
          <p>Filtrar:</p>

          <select value={selectedEstado} onChange={handleEstadoChange}>
            <option value="">Todas las maquinarias</option>
            <option value="Disponibles">Disponibles</option>
            <option value="Asignadas">Asignadas</option>
            <option value="Mantenimiento">En mantenimiento</option>
            <option value="Baja">Dadas de baja</option>
          </select>
          <select value={selectedTipo} onChange={handleTipoChange}>
            <option value="">Todas los tipos</option>
            <option value="Maquina">Maquina</option>
            <option value="Herramienta">Herramienta</option>
          </select>
          <p>Mostrando {equiposMostrados.length} resultados</p>
        </div>
      </div>
      <div className="dashboard-card">
        <div className="maquinaria-container">
          <h2>Listado de Maquinaria</h2>
          <div className="maquinaria-table">
            <Tabla
              columns={columns}
              data={
                selectedTipo
                  ? maquinaria.filter((m) => m.tipo === selectedTipo)
                  : maquinaria
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListadoGeneral;
