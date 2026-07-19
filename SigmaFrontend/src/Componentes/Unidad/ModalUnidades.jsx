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
import FinalizarMantenimientoModal from "./FinalizarMantenimientoModal";
import { API_URL } from "../../../api";

const ModalUnidades = ({ equipo, onClose, onUpdated }) => {
  const [unidades, setUnidades] = useState([]);
  const [unidadMantenimiento, setUnidadMantenimiento] = useState(null);
  const [unidadBaja, setUnidadBaja] = useState(null);
  const [unidadAsignar, setUnidadAsignar] = useState(null);
  const [confirmMantenimientoUnidad, setConfirmMantenimientoUnidad] =
    useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [obraFiltro, setObraFiltro] = useState("");
  const [unidadFecha, setUnidadFecha] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);
  const [seleccionMultiple, setSeleccionMultiple] = useState(false);
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
  const [accionMasiva, setAccionMasiva] = useState("");
  const [modoSeleccionMasiva, setModoSeleccionMasiva] = useState("manual");
  const [cantidadMasiva, setCantidadMasiva] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [unidadDescripcion, setUnidadDescripcion] = useState(null);
  const [unidadEtiqueta, setUnidadEtiqueta] = useState(null);
  const [unidadFechaExistente, setUnidadFechaExistente] = useState(null);

  // modales para acciones masivas con datos extra
  const [modalFechaMasiva, setModalFechaMasiva] = useState(false);
  const [modalObraMasiva, setModalObraMasiva] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rol = usuario?.rol || "";
  const getCantidadUnidad = (unidad) => Number(unidad?.cantidad || 1);

  const cantidadSeleccionada = unidadesSeleccionadas.reduce((total, id) => {
    const unidad = unidades.find((u) => String(u._id) === String(id));
    return total + getCantidadUnidad(unidad);
  }, 0);

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
      const res = await fetch(`${API_URL}/unidades/equipo/${equipo._id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

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
    fetch(`${API_URL}/unidades/mantenimiento/finalizar/${u._id}`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => {
        if (res.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
          throw new Error("Sesión expirada");
        }
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

  const stockDisponible = unidades.filter(
    (u) => String(u.estado || "").toLowerCase() === "disponible",
  ).length;
  const esModoCantidadMasiva = modoSeleccionMasiva === "cantidad";
  const cantidadMasivaNumero = Number(cantidadMasiva);
  const cantidadObjetivoMasiva = esModoCantidadMasiva
    ? cantidadMasivaNumero
    : unidadesSeleccionadas.length;

  const limpiarAccionMasiva = () => {
    setUnidadesSeleccionadas([]);
    setAccionMasiva("");
    setCantidadMasiva("");
  };

  const cambiarModoSeleccionMasiva = (modo) => {
    setModoSeleccionMasiva(modo);
    if (modo === "cantidad") {
      setUnidadesSeleccionadas([]);
    } else {
      setCantidadMasiva("");
    }
  };

  const validarCantidadMasiva = () => {
    if (!Number.isInteger(cantidadMasivaNumero) || cantidadMasivaNumero <= 0) {
      toast.error("Ingresa una cantidad valida");
      return false;
    }

    if (cantidadMasivaNumero > stockDisponible) {
      toast.error(
        `Stock disponible insuficiente. Disponibles: ${stockDisponible}`,
      );
      return false;
    }

    return true;
  };

  // ── Acciones masivas ──
  const darDeBajaMultiplesUnidades = async (ids) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/unidades/baja-multiple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ ids }),
    });

    if (res.status === 401) {
      window.dispatchEvent(new Event("token-expirado"));
      throw new Error("Sesión expirada");
    }

    if (!res.ok) throw new Error("Error al dar de baja");
    toast.success("Unidades dadas de baja");
    handleUpdated();
  };

  const asignarObraMultiplesUnidades = async (ids, obraId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/unidades/asignar-obra-multiples`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ ids, obraId }),
    });
    const body = await res.json().catch(() => ({}));

    if (res.status === 401) {
      window.dispatchEvent(new Event("token-expirado"));
      throw new Error("Sesión expirada");
    }

    if (!res.ok) {
      toast.error(body.error || "Error al asignar unidad");
      return;
    }
    toast.success("Unidades asignadas correctamente");
    handleUpdated();
  };

  const agregarFechaCompraMultiplesUnidades = async (ids, fechaCompra) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/unidades/actualizar-multiples`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ ids, fechaCompra }), // ← ahora manda fechaCompra
    });
    if (res.status === 401) {
      window.dispatchEvent(new Event("token-expirado"));
      throw new Error("Sesión expirada");
    }
    if (!res.ok) throw new Error("Error al agregar fecha de compra");
    toast.success("Fechas de compra agregadas");
    handleUpdated();
  };

  const aplicarAccionMasivaPorCantidad = async ({
    accion,
    cantidad,
    obraId,
    fechaCompra,
  }) => {
    const token = localStorage.getItem("token");
    const payload = {
      equipoId: equipo._id,
      accion,
      cantidad,
    };

    if (obraId) payload.obraId = obraId;
    if (fechaCompra) payload.fechaCompra = fechaCompra;

    const res = await fetch(`${API_URL}/unidades/masivo-por-cantidad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));

    if (res.status === 401) {
      window.dispatchEvent(new Event("token-expirado"));
      throw new Error("Sesion expirada");
    }

    if (!res.ok) {
      throw new Error(body.error || "Error al procesar la cantidad indicada");
    }

    const procesadas = body.cantidadProcesada ?? cantidad;
    toast.success(
      `${procesadas} unidad${procesadas !== 1 ? "es" : ""} procesada${
        procesadas !== 1 ? "s" : ""
      }`,
    );
    handleUpdated();
  };

  // Cuando el usuario hace click en "Aplicar", abrir el modal correspondiente
  const ejecutarAccionMasiva = () => {
    if (!accionMasiva) {
      toast.error("Seleccioná una acción");
      return;
    }
    if (esModoCantidadMasiva) {
      if (!validarCantidadMasiva()) return;
    } else if (unidadesSeleccionadas.length === 0) {
      toast.error("Seleccioná al menos una unidad");
      return;
    }

    if (accionMasiva === "baja") {
      // Esta no necesita datos extra, ejecutar directo
      setBulkLoading(true);
      const accion = esModoCantidadMasiva
        ? aplicarAccionMasivaPorCantidad({
            accion: "baja",
            cantidad: cantidadMasivaNumero,
          })
        : darDeBajaMultiplesUnidades(unidadesSeleccionadas);

      accion
        .then(() => limpiarAccionMasiva())
        .catch((error) =>
          toast.error(error.message || "No se pudo dar de baja"),
        )
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
      if (esModoCantidadMasiva) {
        await aplicarAccionMasivaPorCantidad({
          accion: "asignar",
          cantidad: cantidadMasivaNumero,
          obraId,
        });
      } else {
        await asignarObraMultiplesUnidades(unidadesSeleccionadas, obraId);
      }
      limpiarAccionMasiva();
    } catch (error) {
      toast.error(error.message || "No se pudo asignar la obra");
    } finally {
      setBulkLoading(false);
    }
  };

  const confirmarFechaMasiva = async (fecha) => {
    setModalFechaMasiva(false);
    setBulkLoading(true);
    try {
      if (esModoCantidadMasiva) {
        await aplicarAccionMasivaPorCantidad({
          accion: "fecha",
          cantidad: cantidadMasivaNumero,
          fechaCompra: fecha,
        });
      } else {
        await agregarFechaCompraMultiplesUnidades(
          unidadesSeleccionadas,
          fecha,
        );
      }
      limpiarAccionMasiva();
    } catch (error) {
      toast.error(error.message || "No se pudo agregar la fecha");
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
        limpiarAccionMasiva();
        setModoSeleccionMasiva("manual");
      }
      return !prev;
    });
  };

  const columns = [
    { header: "ID", accessor: "identificador" },
    { header: "Cantidad", accessor: (row) => getCantidadUnidad(row) },
    {
      header: "Etiqueta",
      accessor: (row) =>
        row.etiqueta ? (
          row.etiqueta
        ) : (
          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
            Sin etiqueta
          </span>
        ),
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

    ...(rol === "Admin"
      ? [
          {
            header: "Acciones",
            accessor: (row) => (
              <div className="actions">
                {seleccionMultiple ? (
                  esModoCantidadMasiva ? (
                    <span className="cantidad-multiple-label">
                      Por cantidad
                    </span>
                  ) : (
                    <label className="check-multiple">
                      <input
                        type="checkbox"
                        checked={unidadesSeleccionadas.includes(
                          String(row._id),
                        )}
                        onChange={() => toggleSeleccionUnidad(row._id)}
                      />
                      Seleccionar
                    </label>
                  )
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
                    <button
                      onClick={() => {
                        cerrarTodos();
                        setUnidadDescripcion(row);
                      }}
                    >
                      <FaRegFileAlt title="Editar descripción" />
                    </button>

                    <button
                      onClick={() => {
                        cerrarTodos();
                        setUnidadEtiqueta(row);
                      }}
                    >
                      <FaTag title="Editar etiqueta" />
                    </button>
                  </>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="modal-overlay modal-unidades-overlay">
        <div className="modal-content modal-unidades-content">
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
            {rol === "Admin" && (
              <button className="btn-seleccion" onClick={toggleModoSeleccion}>
                {seleccionMultiple
                  ? "Cancelar selección"
                  : "Selección múltiple"}
              </button>
            )}
          </div>

          {seleccionMultiple && (
            <div className="acciones-masivas">
              <div className="acciones-masivas-info">
                {esModoCantidadMasiva ? (
                  <>
                    Disponibles: <strong>{stockDisponible}</strong>
                  </>
                ) : (
                  <>
                    Seleccionadas:{" "}
                    <strong>{unidadesSeleccionadas.length}</strong>
                  </>
                )}
              </div>
              <div
                className="modo-seleccion-masiva"
                role="group"
                aria-label="Modo de seleccion masiva"
              >
                <label>
                  <input
                    type="radio"
                    name="modo-seleccion-masiva"
                    checked={!esModoCantidadMasiva}
                    onChange={() => cambiarModoSeleccionMasiva("manual")}
                  />
                  Manual
                </label>
                <label>
                  <input
                    type="radio"
                    name="modo-seleccion-masiva"
                    checked={esModoCantidadMasiva}
                    onChange={() => cambiarModoSeleccionMasiva("cantidad")}
                  />
                  Por cantidad
                </label>
              </div>
              {esModoCantidadMasiva && (
                <label className="cantidad-masiva-field">
                  <span>Cantidad</span>
                  <input
                    type="number"
                    min="1"
                    max={stockDisponible || 1}
                    step="1"
                    value={cantidadMasiva}
                    onChange={(e) => setCantidadMasiva(e.target.value)}
                    placeholder="0"
                  />
                </label>
              )}
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
                {!esModoCantidadMasiva && (
                  <>
                    <button type="button" onClick={seleccionarTodasFiltradas}>
                      Seleccionar todo
                    </button>
                    <button type="button" onClick={limpiarSeleccion}>
                      Limpiar selección
                    </button>
                  </>
                )}
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
          equipo={equipo}
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
        <FinalizarMantenimientoModal
          unidad={confirmMantenimientoUnidad}
          onClose={() => setConfirmMantenimientoUnidad(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Modales para acciones masivas */}
      {modalFechaMasiva && (
        <ModalFechaMasiva
          cantidad={cantidadObjetivoMasiva}
          onConfirm={confirmarFechaMasiva}
          onClose={() => setModalFechaMasiva(false)}
        />
      )}
      {modalObraMasiva && (
        <ModalObraMasiva
          cantidad={cantidadObjetivoMasiva}
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
