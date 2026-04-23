import { useEffect, useState } from "react";
const EquiposMantenimiento = () => {
  const [equiposMantenimiento, setEquiposMantenimiento] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchEquiposMantenimiento = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          "http://localhost:5001/maquinaria/mantenimiento",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          if (mounted) alert(r.error || "Error al obtener maquinaria");
          if (mounted) setEquiposMantenimiento(0);
        } else {
          const data = await res.json();
          if (mounted)
            setEquiposMantenimiento(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        if (mounted) alert("Error de conexión");
        if (mounted) setEquiposMantenimiento(0);
      }
    };

    fetchEquiposMantenimiento();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="summary-card summary-card--mantenimiento">
      <div className="summary-card__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 10v7a2 2 0 01-2 2H7l-4 2V6a2 2 0 012-2h11"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="summary-card__number">{equiposMantenimiento}</p>
        <h4 className="summary-card__label">Mantenimiento</h4>
      </div>
    </div>
  );
};

export default EquiposMantenimiento;
