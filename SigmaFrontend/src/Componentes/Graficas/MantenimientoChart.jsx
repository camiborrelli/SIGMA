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
import "./MantenimientoChart.css";
import { API_URL } from "../../../api";

const COLORS = [
  "#c90036",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#94a3b8",
];

const truncar = (value = "") => {
  return value.length > 24 ? `${value.slice(0, 24)}...` : value;
};

function MantenimientoChart({ filtros = {} }) {
  const [data, setData] = useState([]);
  const [estado, setEstado] = useState("loading");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setEstado("loading");
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/graficas/equipos-mantenimiento`, {
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

  if (estado === "loading") {
    return <div className="chart-state">Cargando datos...</div>;
  }

  if (estado === "error") {
    return <div className="chart-state chart-state--error">No se pudo cargar la gráfica.</div>;
  }

  if (!data.length) {
    return <div className="chart-state">No hay mantenimientos para los filtros seleccionados.</div>;
  }

  return (
    <div className="mantenimiento-chart">
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

          <XAxis
            type="number"
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="equipo"
            width={170}
            tickFormatter={truncar}
          />

          <Tooltip formatter={(value) => [`${value} mantenimientos`, "Total"]} />

          <Bar
            dataKey="cantidad"
            name="Mantenimientos"
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

export default MantenimientoChart;
