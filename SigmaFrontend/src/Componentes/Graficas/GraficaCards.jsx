import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBoxes,
  FaCheckCircle,
  FaClipboardList,
  FaTools,
  FaTrashAlt,
} from "react-icons/fa";
import "./GraficaCards.css";
import { API_URL } from "../../../api";

const statsIniciales = {
  total: 0,
  disponibles: 0,
  asignadas: 0,
  mantenimiento: 0,
  bajas: 0,
};

function GraficaCards({ filtros = {} }) {
  const [stats, setStats] = useState({
    ...statsIniciales,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/graficas/resumen`, {
          params: filtros,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats({ ...statsIniciales, ...res.data });
      } catch (error) {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
        }
        console.error("Error al obtener resumen de gráficas:", error);
        setStats({ ...statsIniciales });
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [filtros]);

  const cards = [
    {
      titulo: "Total unidades",
      valor: stats.total,
      icono: <FaBoxes />,
      variante: "total",
    },
    {
      titulo: "Disponibles",
      valor: stats.disponibles,
      icono: <FaCheckCircle />,
      variante: "disponibles",
    },
    {
      titulo: "Asignadas",
      valor: stats.asignadas,
      icono: <FaClipboardList />,
      variante: "asignadas",
    },
    {
      titulo: "Mantenimiento",
      valor: stats.mantenimiento,
      icono: <FaTools />,
      variante: "mantenimiento",
    },
    {
      titulo: "Dadas de baja",
      valor: stats.bajas,
      icono: <FaTrashAlt />,
      variante: "bajas",
    },
  ];

  return (
    <div className="grafica-cards">
      {cards.map((card) => (
        <div className={`grafica-card grafica-card--${card.variante}`} key={card.titulo}>
          <span className="grafica-card-icon">{card.icono}</span>

          <div className="grafica-card-body">
            <p className="grafica-card-title">{card.titulo}</p>
            <h2 className="grafica-card-value">
              {cargando ? "..." : card.valor}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GraficaCards;
