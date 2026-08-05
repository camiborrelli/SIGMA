import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import axios from "axios";
import "./ObraChart.css";
import { API_URL } from "../../../api";

const COLORS = [
  "#f43f5e",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#64748b", 
];

const truncar = (value = "") => {
  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
};

function ObraChart({ filtros = {} }) {
  const [data, setData] = useState([]);
  const [estado, setEstado] = useState("loading");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setEstado("loading");
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/graficas/maquinaria-obra`, {
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
        console.error(error);
        setData([]);
        setEstado("error");
      }
    };

    obtenerDatos();
  }, [filtros]);

  if (estado === "loading") {
    return <div className="chart-state">Cargando datos...</div>;
  }

  if (estado === "error") {
    return <div className="chart-state chart-state--error">No se pudo cargar la gráfica.</div>;
  }

  if (!data.length) {
    return <div className="chart-state">No hay maquinaria asignada para los filtros seleccionados.</div>;
  }

  return (
    <div className="obra-chart">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" allowDecimals={false} />

          <YAxis
            type="category"
            dataKey="obra"
            width={120}
            tickFormatter={truncar}
          />

          <Tooltip formatter={(value) => [`${value} unidades`, "Cantidad"]} />

          <Bar
            dataKey="cantidad"
            name="Cantidad"
            radius={[0, 8, 8, 0]}
            barSize={18}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ObraChart;
