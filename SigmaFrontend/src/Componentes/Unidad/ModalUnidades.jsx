import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import AsignarMantenimientoUnidad from "./AsignarMantenimientoUnidad";
import BajaUnidadModal from "./BajaUnidadModal";
import AsignarUnidadModal from "./AsignarUnidadModal";
import "./ModalUnidades.css";

const ModalUnidades = ({ equipo, onClose, onUpdated }) => {
  const [unidades, setUnidades] = useState([]);

  const [unidadMantenimiento, setUnidadMantenimiento] = useState(null);
  const [unidadBaja, setUnidadBaja] = useState(null);
  const [unidadAsignar, setUnidadAsignar] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(5);

  const cerrarTodos = () => {
    setUnidadMantenimiento(null);
    setUnidadBaja(null);
    setUnidadAsignar(null);
  };

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

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const unidadesPaginadas = unidades.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(unidades.length / itemsPorPagina);

  const columns = [
    { header: "ID", accessor: "identificador" },

    {
      header: "Estado",
      accessor: (row) => {
        const cls =
          row.estado === "Disponible"
            ? "estado-disponible"
            : row.estado === "Asignada"
            ? "estado-asignado"
            : row.estado === "En mantenimiento"
            ? "estado-mantenimiento"
            : "estado-baja";

        return <span className={`estado-badge ${cls}`}>{row.estado}</span>;
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
          <button
            disabled={row.estado === "Dada de Baja"}
            onClick={() => {
              cerrarTodos();
              setUnidadAsignar(row);
            }}
          >
            📍
          </button>

          <button
            disabled={
              row.estado === "En mantenimiento" || row.estado === "Dada de Baja"
            }
            onClick={() => {
              cerrarTodos();
              setUnidadMantenimiento(row);
            }}
          >
            🛠
          </button>

          <button
            disabled={row.estado === "Dada de Baja"}
            onClick={() => {
              cerrarTodos();
              setUnidadBaja(row);
            }}
          >
            🚫
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Unidades de {equipo.nombre}</h2>

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

        <button className="btn-cancel" onClick={onClose}>
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
    </div>
  );
};

export default ModalUnidades;
