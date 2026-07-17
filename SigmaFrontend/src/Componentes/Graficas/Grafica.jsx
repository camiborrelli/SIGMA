import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Grafica.css";

import DashboardHeader from "./GraficaHeader";
import DashboardCards from "./GraficaCards";
import ChartCard from "./ChartCard";
import EstadoChart from "./EstadoChart";
import ObraChart from "./ObraChart";
import MantenimientoChart from "./MantenimientoChart";
import { API_URL } from "../../../api";

const filtrosIniciales = {
  fechaDesde: "",
  fechaHasta: "",
  obraId: "",
  equipoId: "",
};

function Grafica() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [obras, setObras] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargandoFiltros, setCargandoFiltros] = useState(true);

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        };

        const [obrasRes, equiposRes] = await Promise.all([
          axios.get(`${API_URL}/obras`, config),
          axios.get(`${API_URL}/equipos`, config),
        ]);

        setObras(Array.isArray(obrasRes.data) ? obrasRes.data : []);
        setEquipos(Array.isArray(equiposRes.data) ? equiposRes.data : []);
      } catch (error) {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
        }
        console.error("Error al cargar filtros de gráficas:", error);
      } finally {
        setCargandoFiltros(false);
      }
    };

    cargarOpciones();
  }, []);

  const filtrosActivos = useMemo(() => {
    return Object.entries(filtros).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
  }, [filtros]);

  const actualizarFiltro = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <DashboardHeader
          fechaDesde={filtros.fechaDesde}
          fechaHasta={filtros.fechaHasta}
          obraSeleccionada={filtros.obraId}
          equipoSeleccionado={filtros.equipoId}
          obras={obras}
          equipos={equipos}
          cargandoFiltros={cargandoFiltros}
          onFechaDesdeChange={(value) => actualizarFiltro("fechaDesde", value)}
          onFechaHastaChange={(value) => actualizarFiltro("fechaHasta", value)}
          onObraChange={(value) => actualizarFiltro("obraId", value)}
          onEquipoChange={(value) => actualizarFiltro("equipoId", value)}
          onLimpiarFiltros={limpiarFiltros}
        />

        <DashboardCards filtros={filtrosActivos} />

        <div className="charts-grid">
          <ChartCard
            title="Distribución de unidades por estado"
            subtitle="Estado actual de las unidades según los filtros aplicados"
          >
            <EstadoChart filtros={filtrosActivos} />
          </ChartCard>

          <ChartCard
            title="Maquinaria por obra"
            subtitle="Unidades de tipo máquina asignadas a cada obra"
          >
            <ObraChart filtros={filtrosActivos} />
          </ChartCard>

          <ChartCard
            className="chart-card--wide"
            title="Equipos con más mantenimientos"
            subtitle="Ranking por cantidad de ingresos a mantenimiento"
          >
            <MantenimientoChart filtros={filtrosActivos} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default Grafica;
