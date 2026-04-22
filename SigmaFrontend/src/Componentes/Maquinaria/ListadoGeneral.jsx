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

  const columns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Tipo", accessor: "tipo" },
    { header: "Modelo", accessor: "modelo" },
    { header: "Stock", accessor: "stock" },
    { header: "Estado", accessor: "estado" },
    { header: "Obra Asignada", accessor: "obraAsignada" },
  ];

  console.log("Maquinaria obtenida:", maquinaria);

  return (
    <div>
      <h2>Listado de Maquinaria</h2>
      <Tabla columns={columns} data={maquinaria} />
    </div>
  );
};

export default ListadoGeneral;
