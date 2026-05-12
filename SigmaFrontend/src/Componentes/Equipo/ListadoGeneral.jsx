import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import ModalUnidades from "../Unidad/ModalUnidades";
import "./ListadoGeneral.css";

const ListadoGeneral = ({
  onUpdated,
  refreshKey,
  tipoFilter: tipoFilterProp,
  estadoFilter: estadoFilterProp,
  busquedaProp,
}) => {
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

  const navigate = useNavigate();

  const fetchEquipos = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/equipos", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al obtener equipos");
        setEquipos([]);
      } else {
        setEquipos(Array.isArray(data) ? data : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof refreshKey !== "undefined") fetchEquipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // compute effective filters (props override local controls)
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

  // reset page when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [effectiveBusqueda, effectiveTipo, effectiveEstado]);

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
    navigate("/registrarUnidad", { state: { equipoId } });
  };

  const columns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: "modelo" },
    { header: "Tipo", accessor: "tipo" },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="acciones-fila">
          <button
            className="btn-ver"
            onClick={() => setEquipoSeleccionado(row)}
          >
            Ver unidades
          </button>
          <button
            className="btn-register-unidad"
            onClick={() => registrarUnidad(row._id)}
          >
            Registrar unidad
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="equipos-container">
      <h2 className="titulo">Listado de equipos</h2>

      <div
        className="filtros-listado"
        style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}
      >
        {typeof busquedaProp === "undefined" && (
          <input
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
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

        {/* {typeof estadoFilterProp === "undefined" && (
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {[
              ...new Set(
                equipos
                  .map((eq) => eq.estado)
                  .concat(
                    ...equipos.map((eq) =>
                      Array.isArray(eq.unidades)
                        ? eq.unidades.map((u) => u.estado)
                        : [],
                    ),
                  )
                  .filter(Boolean),
              ),
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )} */}
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="tabla-wrapper">
            <Tabla columns={columns} data={equiposPaginados} />
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
    </div>
  );
};

export default ListadoGeneral;
