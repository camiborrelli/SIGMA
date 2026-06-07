import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import AsignarMantenimientoUnidad from "./AsignarMantenimientoUnidad";
import BajaUnidadModal from "./BajaUnidadModal";
import AsignarUnidadModal from "./AsignarUnidadModal";
import "./ModalUnidades.css";
import toast from "react-hot-toast";
import { FaRegCalendarPlus, FaRegFileAlt, FaTag } from "react-icons/fa";
import AgregarFechaCompraModal from "./AgregarFechaCompraModal";
import ModalFechaMasiva from "./ModalFechaMasiva";
import ModalObraMasiva from "./ModalObraMasiva";
import EditarDescripcionModal from "./EditarDescripcionModal";
import EditarEtiquetaModal from "./EditarEtiquetaModal";
import FechaCompraExistenteModal from "./FechaCompraExistenteModal";

const ModalUnidades = ({ equipo, onClose, onUpdated }) => {
  const [unidades, setUnidades] = useState([]);
  const [unidadMantenimiento, setUnidadMantenimiento] = useState(null);
  const [unidadBaja, setUnidadBaja] = useState(null);
  const [unidadAsignar, setUnidadAsignar] = useState(null);
  const [confirmMantenimientoUnidad, setConfirmMantenimientoUnidad] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [obraFiltro, setObraFiltro] = useState("");
  const [unidadFecha, setUnidadFecha] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [seleccionMultiple, setSeleccionMultiple] = useState(false);
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
  const [accionMasiva, setAccionMasiva] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [unidadDescripcion, setUnidadDescripcion] = useState(null);
  const [unidadEtiqueta, setUnidadEtiqueta] = useState(null);
  const [unidadFechaExistente, setUnidadFechaExistente] = useState(null);

  // modales para acciones masivas con datos extra
  const [modalFechaMasiva, setModalFechaMasiva] = useState(false);
  const [modalObraMasiva, setModalObraMasiva] = useState(false);

  const cerrarTodos = () => {
    setUnidadMantenimiento(null);
    setUnidadBaja(null);
    setUnidadAsignar(null);
    setUnidadFecha(null);
    setConfirmMantenimientoUnidad(null);
    setUnidadDescripcion(null);
    setUnidadEtiqueta(null);
    setUnidadFechaExistente(null);
  };

  const navigate = useNavigate();

  const fetchUnidades = async () => {
    const token = localStorage.getItem("token");
    if (!equipo?._id) return;
    try {
      const res = await fetch(
        `http://localhost:5001/unidades/equipo/${equipo._id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );
      if (!res.ok) throw new Error("Error al obtener unidades");
      const data = await res.json();
      const unidadesArray = Array.isArray(data) ? data : [];

      const parseKey = (ident) => {
        if (!ident) return { num: null, str: "" };
        const s = String(ident).trim();
        const m = s.match(/(\d+)$/);
        return m ? { num: Number(m[1]), str: s } : { num: null, str: s };
      };

      unidadesArray.sort((a, b) => {
        const ka = parseKey(a.identificador);
        const kb = parseKey(b.identificador);
        if (ka.num !== null && kb.num !== null) return ka.num - kb.num;
        if (ka.num !== null) return -1;
        if (kb.num !== null) return 1;
        return ka.str.localeCompare(kb.str);
      });
      setUnidades(unidadesArray);
    } catch (err) {
      console.error(err);
      setUnidades([]);
    }
  };

  const handleUpdated = () => {
    fetchUnidades();
    if (onUpdated) onUpdated();
  };

  useEffect(() => {
    if (equipo?._id) fetchUnidades();
  }, [equipo]);

  useEffect(() => {
    setPaginaActual(1);
  }, [equipo, unidades.length]);

  useEffect(() => {
  setPaginaActual(1);
}, [estadoFiltro, obraFiltro]);


  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;
      if (width <= 768) setItemsPorPagina(2);
      else if (width <= 1024) setItemsPorPagina(7);
      else setItemsPorPagina(10);
    };
    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);
    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  const finalizarMantenimiento = (u) => {
    const token = localStorage.getItem("token");
    if (!u?._id) return;
    fetch(`http://localhost:5001/unidades/mantenimiento/finalizar/${u._id}`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success("Mantenimiento finalizado");
        setConfirmMantenimientoUnidad(null);
        handleUpdated();
      })
      .catch(() => toast.error("Error al finalizar mantenimiento"));
  };

  const enviarAMantenimiento = (u) => {
    if (!u) return false;
    const est = String(u.estado || "").toLowerCase();
    if (est.includes("mantenimiento")) {
      setConfirmMantenimientoUnidad(u);
      return false;
    }
    if (est === "dada de baja" || est === "baja") {
      toast.error("La unidad está dada de baja.");
      return false;
    }
    setUnidadMantenimiento(u);
    return true;
  };

  // ── Acciones masivas ──
  const darDeBajaMultiplesUnidades = async (ids) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5001/unidades/baja-multiple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Error al dar de baja");
    toast.success("Unidades dadas de baja");
    handleUpdated();
  };

  const asignarObraMultiplesUnidades = async (ids, obraId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:5001/unidades/asignar-obra-multiples",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ids, obraId }),
      },
    );
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(body.error || "Error al asignar unidad");
      return;
    }
    toast.success("Unidades asignadas correctamente");
    handleUpdated();
  };

  const agregarFechaCompraMultiplesUnidades = async (ids, fechaCompra) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5001/unidades/actualizar-multiples`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ids, fechaCompra }), // ← ahora manda fechaCompra
      },
    );
    if (!res.ok) throw new Error("Error al agregar fecha de compra");
    toast.success("Fechas de compra agregadas");
    handleUpdated();
  };

  // Cuando el usuario hace click en "Aplicar", abrir el modal correspondiente
  const ejecutarAccionMasiva = () => {
    if (!accionMasiva) {
      toast.error("Seleccioná una acción");
      return;
    }
    if (unidadesSeleccionadas.length === 0) {
      toast.error("Seleccioná al menos una unidad");
      return;
    }

    if (accionMasiva === "baja") {
      // Esta no necesita datos extra, ejecutar directo
      setBulkLoading(true);
      darDeBajaMultiplesUnidades(unidadesSeleccionadas)
        .then(() => {
          setUnidadesSeleccionadas([]);
          setAccionMasiva("");
        })
        .catch(() => toast.error("No se pudo dar de baja"))
        .finally(() => setBulkLoading(false));
    } else if (accionMasiva === "asignar") {
      setModalObraMasiva(true); // ← abrir modal para elegir obra
    } else if (accionMasiva === "fecha") {
      setModalFechaMasiva(true); // ← abrir modal para elegir fecha
    }
  };

  const confirmarObraMasiva = async (obraId) => {
    setModalObraMasiva(false);
    setBulkLoading(true);
    try {
      await asignarObraMultiplesUnidades(unidadesSeleccionadas, obraId);
      setUnidadesSeleccionadas([]);
      setAccionMasiva("");
    } catch {
      toast.error("No se pudo asignar la obra");
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmarFechaMasiva = async (fecha) => {
    setModalFechaMasiva(false);
    setBulkLoading(true);
    try {
      await agregarFechaCompraMultiplesUnidades(unidadesSeleccionadas, fecha);
      setUnidadesSeleccionadas([]);
      setAccionMasiva("");
    } catch {
      toast.error("No se pudo agregar la fecha");
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Filtros y paginación ──
  const obrasMap = new Map();
  unidades.forEach((u) => {
    const o = u.ubicacion;
    if (!o) return;
    if (typeof o === "object")
      obrasMap.set(String(o._id), o.nombre || String(o._id));
    else obrasMap.set(String(o), String(o));
  });

  const unidadesFiltradas = unidades.filter((u) => {
    const okEstado = estadoFiltro
      ? String(u.estado || "").toLowerCase() === estadoFiltro.toLowerCase()
      : true;
    const okObra = obraFiltro
      ? typeof u.ubicacion === "object"
        ? String(u.ubicacion._id) === obraFiltro
        : String(u.ubicacion) === obraFiltro
      : true;
    return okEstado && okObra;
  });

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const unidadesPaginadas = unidadesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas =
    Math.ceil(unidadesFiltradas.length / itemsPorPagina) || 1;
  const idsFiltradas = unidadesFiltradas.map((u) => String(u._id));

  const toggleSeleccionUnidad = (id) => {
    const idStr = String(id);
    setUnidadesSeleccionadas((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr],
    );
  };

  const seleccionarTodasFiltradas = () => {
    setUnidadesSeleccionadas((prev) => [
      ...new Set([...prev, ...idsFiltradas]),
    ]);
  };

  const limpiarSeleccion = () => setUnidadesSeleccionadas([]);

  const toggleModoSeleccion = () => {
    setSeleccionMultiple((prev) => {
      if (prev) {
        setUnidadesSeleccionadas([]);
        setAccionMasiva("");
      }
      return !prev;
    });
  };

  const columns = [
    { header: "ID", accessor: "identificador" },
    {
      header: "Etiqueta",
      accessor: (row) => row.etiqueta ? row.etiqueta : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin etiqueta</span>
    },
    {
      header: "Estado",
      accessor: (row) => {
        const est = String(row.estado || "").toLowerCase();
        const cls =
          est === "disponible"
            ? "estado-disponible"
            : est === "asignada"
            ? "estado-asignado"
            : est.includes("mantenimiento")
            ? "estado-mantenimiento"
            : "estado-baja";
        return <span className={`estado-badge ${cls}`}>{row.estado}</span>;
      },
    },
    {
      header: "Obra",
      accessor: (row) =>
        row.ubicacion && typeof row.ubicacion === "object"
          ? row.ubicacion.nombre || "Sin asignar"
          : row.ubicacion || "Sin asignar",
    },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          {seleccionMultiple ? (
            <label className="check-multiple">
              <input
                type="checkbox"
                checked={unidadesSeleccionadas.includes(String(row._id))}
                onChange={() => toggleSeleccionUnidad(row._id)}
              />
              Seleccionar
            </label>
          ) : (
            <>
              <button
                onClick={() => {
                  cerrarTodos();
                  setUnidadAsignar(row);
                }}
              >
                📍
              </button>
              <button
                onClick={() => {
                  cerrarTodos();
                  const ok = enviarAMantenimiento(row);
                  if (ok) {
                    onClose();
                    navigate(`/garantia/${row._id}`);
                  }
                }}
              >
                🛠
              </button>
              <button
                onClick={() => {
                  cerrarTodos();
                  setUnidadBaja(row);
                }}
              >
                🚫
              </button>
              <button
                onClick={() => {
                  cerrarTodos();

                  if (row.fechaCompra) {
                    setUnidadFechaExistente(row);
                  } else {
                    setUnidadFecha(row);
                  }
                }}
              >
                <FaRegCalendarPlus />
              </button>
              <button onClick={() => { cerrarTodos(); setUnidadDescripcion(row); }}>
                <FaRegFileAlt title="Editar descripción" />
              </button>

              <button onClick={() => { cerrarTodos(); setUnidadEtiqueta(row); }}>
                <FaTag title="Editar etiqueta" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Unidades de {equipo.nombre}</h2>

          <div className="filtros">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Asignada">Asignada</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="Dada de Baja">Dada de Baja</option>
            </select>
            <select
              value={obraFiltro}
              onChange={(e) => setObraFiltro(e.target.value)}
            >
              <option value="">Todas las obras</option>
              {[...obrasMap.entries()].map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <button className="btn-seleccion" onClick={toggleModoSeleccion}>
              {seleccionMultiple ? "Cancelar selección" : "Selección múltiple"}
            </button>
          </div>

          {seleccionMultiple && (
            <div className="acciones-masivas">
              <div className="acciones-masivas-info">
                Seleccionadas: <strong>{unidadesSeleccionadas.length}</strong>
              </div>
              <select
                value={accionMasiva}
                onChange={(e) => setAccionMasiva(e.target.value)}
              >
                <option value="">Elegí una acción</option>
                <option value="baja">Dar de baja</option>
                <option value="asignar">Asignar a obra</option>
                <option value="fecha">Agregar fecha de compra</option>
              </select>
              <div className="acciones-masivas-botones">
                <button type="button" onClick={seleccionarTodasFiltradas}>
                  Seleccionar todo
                </button>
                <button type="button" onClick={limpiarSeleccion}>
                  Limpiar selección
                </button>
                <button
                  type="button"
                  className="btn-aplicar-masiva"
                  onClick={ejecutarAccionMasiva}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? "Aplicando..." : "Aplicar"}
                </button>
              </div>
            </div>
          )}

          <Tabla
            columns={columns}
            data={unidadesPaginadas}
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onPaginaAnterior={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            onPaginaSiguiente={() =>
              setPaginaActual((p) => Math.min(p + 1, totalPaginas))
            }
          />

          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Modales individuales */}
      {unidadMantenimiento && (
        <AsignarMantenimientoUnidad
          unidad={unidadMantenimiento}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
      {unidadBaja && (
        <BajaUnidadModal
          unidad={unidadBaja}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
      {unidadAsignar && (
        <AsignarUnidadModal
          unidad={unidadAsignar}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
      {unidadFecha && (
        <AgregarFechaCompraModal
          unidad={unidadFecha}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
      {unidadFechaExistente && (
        <FechaCompraExistenteModal
          unidad={unidadFechaExistente}
          onClose={() => setUnidadFechaExistente(null)}
        />
      )}
      {confirmMantenimientoUnidad && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmMantenimientoUnidad(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380 }}
          >
            <h2>Finalizar mantenimiento</h2>
            <p style={{ margin: "12px 0", color: "#64748b", fontSize: 14 }}>
              ¿Confirmar que el mantenimiento de{" "}
              <strong>{confirmMantenimientoUnidad.identificador}</strong> está
              finalizado?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-aplicar-masiva"
                onClick={() =>
                  finalizarMantenimiento(confirmMantenimientoUnidad)
                }
                style={{ flex: 1 }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmMantenimientoUnidad(null)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e8e8e8",
                  background: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales para acciones masivas */}
      {modalFechaMasiva && (
        <ModalFechaMasiva
          cantidad={unidadesSeleccionadas.length}
          onConfirm={confirmarFechaMasiva}
          onClose={() => setModalFechaMasiva(false)}
        />
      )}
      {modalObraMasiva && (
        <ModalObraMasiva
          cantidad={unidadesSeleccionadas.length}
          onConfirm={confirmarObraMasiva}
          onClose={() => setModalObraMasiva(false)}
        />
      )}
      {unidadDescripcion && (
        <EditarDescripcionModal
          unidad={unidadDescripcion}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
      {unidadEtiqueta && (
        <EditarEtiquetaModal
          unidad={unidadEtiqueta}
          onClose={cerrarTodos}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
};

export default ModalUnidades;
