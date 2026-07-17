import { FiRefreshCw } from "react-icons/fi";
import "./GraficaHeader.css";

const GraficaHeader = ({
  fechaDesde = "",
  fechaHasta = "",
  obraSeleccionada = "",
  equipoSeleccionado = "",
  obras = [],
  equipos = [],
  cargandoFiltros = false,
  onFechaDesdeChange,
  onFechaHastaChange,
  onObraChange,
  onEquipoChange,
  onLimpiarFiltros,
}) => {
  return (
    <section className="grafica-header">
      <div className="grafica-header-info">
        <h1>Informes y Gráficas</h1>
        <p>
          Visualiza el estado actual de las unidades, distribución por obras,
          mantenimientos y datos operativos.
        </p>
      </div>

      <div className="grafica-filtros">
        <div className="filtro-group">
          <label htmlFor="grafica-fecha-desde">Desde</label>
          <input
            id="grafica-fecha-desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label htmlFor="grafica-fecha-hasta">Hasta</label>
          <input
            id="grafica-fecha-hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label htmlFor="grafica-obra">Obra</label>
          <select
            id="grafica-obra"
            value={obraSeleccionada}
            onChange={(e) => onObraChange(e.target.value)}
            disabled={cargandoFiltros}
          >
            <option value="">Todas las obras</option>

            {obras?.map((obra) => (
              <option key={obra._id} value={obra._id}>
                {obra.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label htmlFor="grafica-equipo">Equipo</label>
          <select
            id="grafica-equipo"
            value={equipoSeleccionado}
            onChange={(e) => onEquipoChange(e.target.value)}
            disabled={cargandoFiltros}
          >
            <option value="">Todos los equipos</option>

            {equipos?.map((equipo) => (
              <option key={equipo._id} value={equipo._id}>
                {[equipo.nombre, equipo.modelo, equipo.tipo]
                  .filter(Boolean)
                  .join(" - ")}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-limpiar"
          onClick={onLimpiarFiltros}
          title="Limpiar filtros"
        >
          <FiRefreshCw />
          Limpiar filtros
        </button>
      </div>
    </section>
  );
};

export default GraficaHeader;
