import { useState, useEffect } from "react";

const EquiposAsignados = () => {
  const [equiposAsignados, setEquiposAsignados] = useState(0);

  useEffect(() => {
    let mounted = true;
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

    fetchEquiposAsignados();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="summary-card summary-card--asignadas">
      <div className="summary-card__icon" aria-hidden>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
            fill="#fff"
            opacity="0.06"
          />
          <path
            d="M12 7a5 5 0 100 10 5 5 0 000-10z"
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="summary-card__content">
        <p className="summary-card__number">{equiposAsignados}</p>
        <h4 className="summary-card__label">Asignados</h4>
      </div>
    </div>
  );
};

export default EquiposAsignados;
