import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import AsignarMantenimientoUnidad from "./AsignarMantenimientoUnidad";
import BajaUnidadModal from "./BajaUnidadModal";
import AsignarUnidadModal from "./AsignarUnidadModal";
import "./ModalUnidades.css";
import toast from "react-hot-toast";
import { FaRegCalendarPlus} from "react-icons/fa";
import AgregarFechaCompraModal from "./AgregarFechaCompraModal";

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

  const cerrarTodos = () => {
    setUnidadMantenimiento(null);
    setUnidadBaja(null);
    setUnidadAsignar(null);
    setUnidadFecha(null);
  };

  const navigate = useNavigate();

  const fetchUnidades = async () => {
    const token = localStorage.getItem("token");
    console.log("ModalUnidades: fetching unidades for equipo:", equipo);
    if (!equipo?._id) return;

    try {
      const res = await fetch(
        `http://localhost:5001/unidades/equipo/${equipo._id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      console.log(
        "GET /unidades/equipo/ URL:",
        `http://localhost:5001/unidades/equipo/${equipo._id}`,
        "status:",
        res.status,
      );

      if (!res.ok) throw new Error("Error al obtener unidades");

      const data = await res.json();
      // ordenar unidades por el sufijo numérico del identificador si existe
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

        if (ka.num !== null && kb.num !== null) {
          return ka.num - kb.num;
        }

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
    if (onUpdated) {
      onUpdated();
    }
  };

  useEffect(() => {
    if (equipo?._id) fetchUnidades();
  }, [equipo]);

  useEffect(() => {
    setPaginaActual(1);
  }, [equipo, unidades.length]);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;
      if (width <= 768) setItemsPorPagina(5);
      else if (width <= 1024) setItemsPorPagina(6);
      else setItemsPorPagina(7);
    };

    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);

    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  const finalizarMantenimiento = (u) => {
    const token = localStorage.getItem("token");
    if (!u || !u._id) return;
    try {
      const res = fetch(
        `http://localhost:5001/unidades/mantenimiento/finalizar/${u._id}`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      )
        .then((res) => {
          if (!res.ok) throw new Error("Error al finalizar mantenimiento");
          return res.json();
        })
        .then((data) => {
          toast.success("Mantenimiento finalizado");
          handleUpdated();
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error al finalizar mantenimiento");
        });
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };
  //Unidad -> mantenimiento
  const enviarAMantenimiento = (u) => {
    if (!u) return false;
    const est = String(u.estado || "").toLowerCase();
    if (est.includes("mantenimiento")) {
      // mostrar modal preguntando si desea finalizar o ver garantía
      setConfirmMantenimientoUnidad(u);
      return false;
    } else if (est === "dada de baja" || est === "baja") {
      toast.error("La unidad está dada de baja.");
      return false;
    }
    setUnidadMantenimiento(u);
    return true;
  };

  // preparar opciones de obras (normalizar objetos y strings)
  const obrasMap = new Map();
  unidades.forEach((u) => {
    const o = u.ubicacion;
    if (!o) return;
    if (typeof o === "object") {
      obrasMap.set(String(o._id), o.nombre || String(o._id));
    } else {
      obrasMap.set(String(o), String(o));
    }
  });

  // filtrar unidades por estado y obra seleccionadas
  const unidadesFiltradas = unidades.filter((u) => {
    let okEstado = true;
    if (estadoFiltro) {
      okEstado =
        String(u.estado || "").toLowerCase() ===
        String(estadoFiltro || "").toLowerCase();
    }

    let okObra = true;
    if (obraFiltro) {
      if (u.ubicacion && typeof u.ubicacion === "object") {
        okObra = String(u.ubicacion._id) === String(obraFiltro);
      } else {
        okObra = String(u.ubicacion) === String(obraFiltro);
      }
    }

    return okEstado && okObra;
  });

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const unidadesPaginadas = unidadesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas =
    Math.ceil(unidadesFiltradas.length / itemsPorPagina) || 1;

  const columns = [
    { header: "ID", accessor: "identificador" },

    {
      header: "Estado",
      accessor: (row) => {
        const est = String(row.estado || "").toLowerCase();
        const cls =
          est === "disponible"
            ? "estado-disponible"
            : est === "asignada"
            ? "estado-asignado"
            : est === "en mantenimiento" || est === "mantenimiento"
            ? "estado-mantenimiento"
            : "estado-baja";

        // mostrar el valor original si existe, o capitalizar el normalizado
        const label =
          row.estado || (est ? est.charAt(0).toUpperCase() + est.slice(1) : "");
        return <span className={`estado-badge ${cls}`}>{label}</span>;
      },
    },

    {
      header: "Obra",
      accessor: (row) => {
        if (row.ubicacion && typeof row.ubicacion === "object") {
          return row.ubicacion.nombre || "Sin asignar";
        }
        if (typeof row.ubicacion === "string") return row.ubicacion;
        return "Sin asignar";
      },
    },

    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          {(() => {
            const est = String(row.estado || "").toLowerCase();
            const isBaja = est === "dada de baja" || est === "baja";
            const isMantenimiento =
              est === "en mantenimiento" || est === "mantenimiento";

            return (
              <>
                <button
                  disabled={isBaja}
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
                  disabled={isBaja}
                  onClick={() => {
                    cerrarTodos();
                    setUnidadBaja(row);
                  }}
                >
                  🚫
                </button>

                <button
                  title={
                    row.fechaCompra
                      ? "Ver garantía"
                      : "Agregar fecha de compra"
                  }
                  onClick={() => {
                    cerrarTodos();

                    if (row.fechaCompra) {
                      onClose();
                      navigate(`/garantia/${row._id}`);
                    } else {
                      setUnidadFecha(row);
                    }
                  }}
                >
                  <FaRegCalendarPlus />
                </button>

              </>
            );
          })()}
        </div>
      ),
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Unidades de {equipo.nombre}</h2>
        <div className="filtros">
          <select
            name=""
            id=""
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
            name=""
            id=""
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
        </div>

        <Tabla columns={columns} data={unidadesPaginadas} />

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

        <button className="btn-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>

      {unidadMantenimiento && (
        <AsignarMantenimientoUnidad
          unidad={unidadMantenimiento}
          onClose={() => setUnidadMantenimiento(null)}
          onUpdated={handleUpdated}
        />
      )}

      {unidadBaja && (
        <BajaUnidadModal
          unidad={unidadBaja}
          onClose={() => setUnidadBaja(null)}
          onUpdated={handleUpdated}
        />
      )}

      {unidadAsignar && (
        <AsignarUnidadModal
          unidad={unidadAsignar}
          onClose={() => setUnidadAsignar(null)}
          onUpdated={handleUpdated}
        />
      )}

      {unidadFecha && (
        <AgregarFechaCompraModal
          unidad={unidadFecha}
          onClose={() => setUnidadFecha(null)}
          onUpdated={handleUpdated}
        />
      )}

      {confirmMantenimientoUnidad && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Unidad en mantenimiento</h3>
            <p>
              La unidad{" "}
              <strong>{confirmMantenimientoUnidad.identificador}</strong> está
              actualmente en mantenimiento.
            </p>
            <p>¿Desea finalizar el mantenimiento o ver la garantía?</p>

            <div className="acciones">
              <button
                className="btn-cancel"
                onClick={() => setConfirmMantenimientoUnidad(null)}
              >
                Cancelar
              </button>

              <button
                className="btn-asign"
                onClick={() =>
                  finalizarMantenimiento(confirmMantenimientoUnidad)
                }
              >
                Finalizar mantenimiento
              </button>

              <button
                className="btn-asign"
                onClick={() => {
                  const id = confirmMantenimientoUnidad._id;
                  setConfirmMantenimientoUnidad(null);
                  onClose();
                  navigate(`/garantia/${id}`);
                }}
              >
                Ver garantía
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalUnidades;
