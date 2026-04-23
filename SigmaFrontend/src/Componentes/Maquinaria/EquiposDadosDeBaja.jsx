import { useEffect, useState } from "react";

const EquiposDadosDeBaja = () => {
  const [equiposDadosDeBaja, setEquiposDadosDeBaja] = useState(0);

  useEffect(() => {
    const fetchEquiposDadosDeBaja = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5001/maquinaria/bajas", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          const r = await res.json().catch(() => ({}));
          alert(r.error || "Error al obtener maquinaria");
          setEquiposDadosDeBaja(0);
        } else {
          const data = await res.json();
          setEquiposDadosDeBaja(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        alert("Error de conexión");
        setEquiposDadosDeBaja(0);
      }
    };

    fetchEquiposDadosDeBaja();
  }, []);

  return (
    <div className="summary-card summary-card--debaja">
      <div className="summary-card__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke="#6b7280"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="summary-card__number">{equiposDadosDeBaja}</p>
        <h4 className="summary-card__label">Dados de Baja</h4>
      </div>
    </div>
  );
};

export default EquiposDadosDeBaja;
