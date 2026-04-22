import React, { useEffect, useState } from "react";
import ListadoGeneral from "../Maquinaria/ListadoGeneral";

const Dashboard = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaquinas = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/maquinaria", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const r = await res.json();
          setError(r.error || "Error al obtener maquinarias");
          return;
        }

        const data = await res.json();
        setMaquinas(data || []);
      } catch (err) {
        setError("Error de conexión");
      }
    };

    fetchMaquinas();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <ListadoGeneral />
        {error && <p className="error">{error}</p>}
        {maquinas.length === 0 && !error && (
          <p>No hay maquinarias disponibles</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
