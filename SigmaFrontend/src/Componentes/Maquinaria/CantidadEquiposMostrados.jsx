import { useEffect } from "react";
import { use } from "react";


const CantidadEquiposMostrados = ({ cantidad }) => {
   useEffect(() => {
     const fetchEquiposAsignados = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const res = await fetch("http://localhost:5001/maquinaria/asignadas", {
          headers,
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          console.error("Error fetching /maquinaria/asignadas:", res.status, r);
          if (mounted) alert(r.error || "Error al obtener maquinaria asignada");
          // do not overwrite existing count on error
        } else {
          const data = await res.json();
          console.log("/maquinaria/asignadas response:", data);
          if (mounted) setEquiposAsignados(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error("Network error fetching /maquinaria/asignadas:", err);
        if (mounted) alert("Error de conexión");
        // do not overwrite existing count on network error
      }
    };



  return (
    <div className="cantidad-equipos">
      <p className="cantidad-equipos__numero">{cantidad}</p>
      <p className="cantidad-equipos__texto">Equipos Mostrados</p>
    </div>
  );
};

export default CantidadEquiposMostrados;