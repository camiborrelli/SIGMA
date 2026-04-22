import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";

const ListadoGeneral = () => {
  const [maquinaria, setMaquinaria] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaquinaria = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/maquinaria", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          setError(r.error || "Error al obtener la maquinaria");
          setMaquinaria([]);
        } else {
          const data = await res.json();
          setMaquinaria(data || []);
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchMaquinaria();
  }, []);

  console.log("Maquinaria obtenida:", maquinaria);

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
          row.obra && typeof row.obra === "object"
            ? row.obra.nombre
            : row.obra || "Sin asignar";
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
          <button className="action-btn icon-key" title="Asignar">
            <span className="icon">🔑</span>
          </button>
          <button className="action-btn icon-delete" title="Eliminar">
            <span className="icon">🗑️</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2>Listado de Maquinaria</h2>
      <Tabla columns={columns} data={maquinaria} />
    </div>
  );
};

export default ListadoGeneral;
