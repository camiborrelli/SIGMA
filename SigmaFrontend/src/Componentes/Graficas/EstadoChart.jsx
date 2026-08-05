import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";
import "./EstadoChart.css";
import { API_URL } from "../../../api";

const COLORS = [
  "#6d28d9",
  "#a855f7",
  "#d946ef",
  "#4f46e5",
];

const ESTADO_COLORS = {
  Disponible: "#6d28d9",
  Asignada: "#bf81f9",
  "En mantenimiento": "#d946ef",
  "Dada de Baja": "#dc2626",
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <div className="grafica-tooltip">
      <span>{item.name}</span>
      <strong>{item.value} unidades</strong>
    </div>
  );
};

function EstadoChart({ filtros = {} }) {
  const [data, setData] = useState([]);
  const [estado, setEstado] = useState("loading");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setEstado("loading");
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/graficas/unidades-estado`, {
          params: filtros,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(Array.isArray(res.data) ? res.data : []);
        setEstado("ready");
      } catch (error) {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
        }
        console.error("Error al obtener datos:", error);
        setData([]);
        setEstado("error");
      }
    };

    obtenerDatos();
  }, [filtros]);

  const dataVisible = data.filter((item) => Number(item.cantidad) > 0);

  if (estado === "loading") {
    return <div className="chart-state">Cargando datos...</div>;
  }

  if (estado === "error") {
    return <div className="chart-state chart-state--error">No se pudo cargar la gráfica.</div>;
  }

  if (!dataVisible.length) {
    return <div className="chart-state">No hay datos para los filtros seleccionados.</div>;
  }

  return (
    <div className="estado-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataVisible}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={55}
            paddingAngle={2}
            label={({ percent, value }) => {
              const porcentaje = percent * 100;
              return `${porcentaje < 0.1 && value > 0 ? "<0.1" : porcentaje.toFixed(1)}%`;
            }}
          >
            {dataVisible.map((entry, index) => (
              <Cell
                key={entry.estado}
                fill={ESTADO_COLORS[entry.estado] || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EstadoChart;
