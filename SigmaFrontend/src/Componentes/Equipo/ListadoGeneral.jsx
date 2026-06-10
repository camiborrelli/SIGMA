import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import ModalUnidades from "../Unidad/ModalUnidades";
import "./ListadoGeneral.css";
import { FaEye, FaPlus, FaEdit } from "react-icons/fa";
import { LuWrench } from "react-icons/lu";
import { FiTruck } from "react-icons/fi";
import { FaList } from "react-icons/fa";
import EditarEquipoModal from "./EditarEquipoModal";

const ListadoGeneral = ({
  onUpdated,
  refreshKey,
  tipoFilter: tipoFilterProp,
  estadoFilter: estadoFilterProp,
  busquedaProp,
  onRegistrarUnidadClick,
}) => {
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [equipoEditar, setEquipoEditar] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  const [verDetalleStock, setVerDetalleStock] = useState(false);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setPorPagina(4); // Mobile
      } else if (width <= 1024) {
        setPorPagina(5); // Tablet
      } else {
        setPorPagina(6); // Desktop
      }
    };

    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);
    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  const fetchEquipos = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/equipos", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const data = await res.json();

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) {
        setError(data.error || "Error al obtener equipos");
        setEquipos([]);
      } else {
        const equiposOrdenados = (Array.isArray(data) ? data : []).sort(
          (a, b) => (a.nombre || "").localeCompare(b.nombre || ""),
        );
        setEquipos(equiposOrdenados);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchEquipos();
    }
  }, [refreshKey]);

  const effectiveTipo =
    typeof tipoFilterProp !== "undefined" &&
    tipoFilterProp !== null &&
    tipoFilterProp !== ""
      ? tipoFilterProp
      : tipoFilter;
  const effectiveEstado =
    typeof estadoFilterProp !== "undefined" &&
    estadoFilterProp !== null &&
    estadoFilterProp !== ""
      ? estadoFilterProp
      : estadoFilter;
  const effectiveBusqueda =
    typeof busquedaProp !== "undefined" && busquedaProp !== null
      ? String(busquedaProp)
      : busqueda;

  useEffect(() => {
    setPaginaActual(1);
  }, [effectiveBusqueda, effectiveTipo, effectiveEstado, porPagina]);

  const equiposFiltrados = equipos.filter((e) => {
    const texto = `${e.nombre || ""} ${e.modelo || ""} ${
      e.tipo || ""
    }`.toLowerCase();
    const matchesBusqueda = texto.includes(
      String(effectiveBusqueda || "").toLowerCase(),
    );

    const matchesTipo = effectiveTipo
      ? String(e.tipo || "").toLowerCase() ===
        String(effectiveTipo || "").toLowerCase()
      : true;

    let matchesEstado = true;
    if (effectiveEstado) {
      const eff = String(effectiveEstado || "").toLowerCase();
      if (e.estado) {
        matchesEstado = String(e.estado || "").toLowerCase() === eff;
      } else if (Array.isArray(e.unidades)) {
        matchesEstado = e.unidades.some(
          (u) => String(u.estado || "").toLowerCase() === eff,
        );
      } else {
        matchesEstado = false;
      }
    }

    return matchesBusqueda && matchesTipo && matchesEstado;
  });

  const totalPaginas = Math.ceil(equiposFiltrados.length / porPagina) || 1;
  const indiceInicio = (paginaActual - 1) * porPagina;
  const indiceFin = indiceInicio + porPagina;
  const equiposPaginados = equiposFiltrados.slice(indiceInicio, indiceFin);

  const registrarUnidad = (equipoId) => {
    if (onRegistrarUnidadClick) {
      onRegistrarUnidadClick(equipoId);
    }
  };

  const baseColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: "modelo" },
    { header: "Tipo", accessor: "tipo" },
    { header: "Stock", accessor: (row) => row.stock + " unidades" },
    {
      header: "Detalle stock",
      accessor: (row) => (
        <button
          className="icon-btn detalle-stock-btn"
          title="Ver detalle de stock"
          onClick={() => setVerDetalleStock(!verDetalleStock)}
        >
          <FaList />
        </button>
      ),
    },
  ];

  const detalleColumns = [
    { header: "Disponible", accessor: (row) => row.disponible },
    { header: "Asignado", accessor: (row) => row.asignado },
    { header: "Mantenimiento", accessor: (row) => row.mantenimiento },
    { header: "Baja", accessor: (row) => row.baja },
  ];

  const accionesColumn = {
    header: "Acciones",
    accessor: (row) => (
      <div className="acciones-fila">
        <button
          className="icon-btn ver"
          title="Ver unidades"
          onClick={() => setEquipoSeleccionado(row)}
        >
          <FaEye />
        </button>
        <button
          className="icon-btn add"
          title="Registrar unidad"
          onClick={() => registrarUnidad(row._id || row.id)}
        >
          <FaPlus />
        </button>
        <button
          className="icon-btn edit"
          title="Editar equipo"
          onClick={() => setEquipoEditar(row)}
        >
          <FaEdit />
        </button>
      </div>
    ),
    className: "col-acciones",
  };

  // Finalmente, armás el array según el estado
  const columns = verDetalleStock
    ? [...baseColumns, ...detalleColumns, accionesColumn]
    : [...baseColumns, accionesColumn];

  return (
    <div className="equipos-container">
      <div
        className="filtros-listado"
        style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}
      >
        {typeof busquedaProp === "undefined" && (
          <input
            placeholder="Buscar equipo por nombre o modelo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        )}

        {typeof tipoFilterProp === "undefined" && (
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {[...new Set(equipos.map((eq) => eq.tipo).filter(Boolean))].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        )}
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="tabla-desktop">
            <Tabla columns={columns} data={equiposPaginados} />
          </div>

          <div className="equipos-mobile">
            {equiposPaginados.map((eq) => (
              <div key={eq._id || eq.id} className="equipo-card">
                <div className="equipo-card-header">
                  {eq.tipo == "Maquina" ? (
                    <FiTruck className="equipo-svg" />
                  ) : (
                    <LuWrench className="equipo-svg" />
                  )}
                  <span className="equipo-nombre-card">{eq.nombre}</span>
                  <span
                    className={`equipo-tipo-tag tag-${String(
                      eq.tipo || "sin-tipo",
                    )
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-")}`}
                  >
                    {eq.tipo || "Sin tipo"}
                  </span>
                </div>

                <div className="equipo-info">
                  <p>
                    <strong>Modelo:</strong> {eq.modelo || "N/A"}
                  </p>

                  <p>
                    <strong>Stock:</strong> {eq.stock} unidad
                    {eq.stock !== 1 ? "es" : ""}
                  </p>
                </div>

                <div className="equipo-card-acciones">
                  <button
                    className="icon-btn ver"
                    title="Ver unidades"
                    onClick={() => setEquipoSeleccionado(eq)}
                  >
                    <FaEye /> Ver Unidades
                  </button>
                  <button
                    className="icon-btn add"
                    title="Registrar unidad"
                    onClick={() => registrarUnidad(eq._id || eq.id)}
                  >
                    <FaPlus /> Añadir
                  </button>
                  <button
                    className="icon-btn edit"
                    title="Editar equipo"
                    onClick={() => setEquipoEditar(eq)}
                  >
                    <FaEdit /> Editar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                ⬅
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                ➡
              </button>
            </div>
          )}
        </>
      )}

      {equipoSeleccionado && (
        <ModalUnidades
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
          onUpdated={onUpdated}
        />
      )}

      {equipoEditar && (
        <EditarEquipoModal
          equipo={equipoEditar}
          onClose={() => setEquipoEditar(null)}
          onUpdated={() => {
            setEquipoEditar(null);
            fetchEquipos();
          }}
        />
      )}
    </div>
  );
};

export default ListadoGeneral;
