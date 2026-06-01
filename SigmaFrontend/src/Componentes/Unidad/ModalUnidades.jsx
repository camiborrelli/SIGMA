import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Tabla from "../Tabla";
import AsignarMantenimientoUnidad from "./AsignarMantenimientoUnidad";
import BajaUnidadModal from "./BajaUnidadModal";
import AsignarUnidadModal from "./AsignarUnidadModal";
import "./ModalUnidades.css";
import toast from "react-hot-toast";
import { FaRegCalendarPlus } from "react-icons/fa";
import AgregarFechaCompraModal from "./AgregarFechaCompraModal";

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

  const cerrarTodos = () => {
    setUnidadMantenimiento(null);
    setUnidadBaja(null);
    setUnidadAsignar(null);
    setUnidadFecha(null);
    setConfirmMantenimientoUnidad(null);
  };

  const navigate = useNavigate();

  const fetchUnidades = async () => {
    const token = localStorage.getItem("token");
    if (!equipo?._id) return;
    try {
      const res = await fetch(`http://localhost:5001/unidades/equipo/${equipo._id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
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
    if (!u || !u._id) return;
    fetch(`http://localhost:5001/unidades/mantenimiento/finalizar/${u._id}`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error");
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
    } else if (est === "dada de baja" || est === "baja") {
      toast.error("La unidad está dada de baja.");
      return false;
    }
    setUnidadMantenimiento(u);
    return true;
  };

  const obrasMap = new Map();
  unidades.forEach((u) => {
    const o = u.ubicacion;
    if (!o) return;
    if (typeof o === "object") obrasMap.set(String(o._id), o.nombre || String(o._id));
    else obrasMap.set(String(o), String(o));
  });

  const unidadesFiltradas = unidades.filter((u) => {
    const okEstado = estadoFiltro ? String(u.estado || "").toLowerCase() === String(estadoFiltro || "").toLowerCase() : true;
    const okObra = obraFiltro ? (u.ubicacion && typeof u.ubicacion === "object" ? String(u.ubicacion._id) === String(obraFiltro) : String(u.ubicacion) === String(obraFiltro)) : true;
    return okEstado && okObra;
  });

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const unidadesPaginadas = unidadesFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(unidadesFiltradas.length / itemsPorPagina) || 1;

  const columns = [
    { header: "ID", accessor: "identificador" },
    {
      header: "Estado",
      accessor: (row) => {
        const est = String(row.estado || "").toLowerCase();
        const cls = est === "disponible" ? "estado-disponible" : est === "asignada" ? "estado-asignado" : est.includes("mantenimiento") ? "estado-mantenimiento" : "estado-baja";
        const label = row.estado || (est ? est.charAt(0).toUpperCase() + est.slice(1) : "");
        return <span className={`estado-badge ${cls}`}>{label}</span>;
      },
    },
    { header: "Obra", accessor: (row) => (row.ubicacion && typeof row.ubicacion === "object" ? row.ubicacion.nombre || "Sin asignar" : row.ubicacion || "Sin asignar") },
    {
      header: "Acciones",
      accessor: (row) => (
        <div className="actions">
          <button onClick={() => { cerrarTodos(); setUnidadAsignar(row); }}>📍</button>
          <button onClick={() => { cerrarTodos(); const ok = enviarAMantenimiento(row); if (ok) { onClose(); navigate(`/garantia/${row._id}`); } }}>🛠</button>
          <button onClick={() => { cerrarTodos(); setUnidadBaja(row); }}>🚫</button>
          <button onClick={() => { cerrarTodos(); row.fechaCompra ? (onClose(), navigate(`/garantia/${row._id}`)) : setUnidadFecha(row); }}>
            <FaRegCalendarPlus />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Unidades de {equipo.nombre}</h2>
        <div className="filtros">
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignada">Asignada</option>
            <option value="En mantenimiento">En mantenimiento</option>
            <option value="Dada de Baja">Dada de Baja</option>
          </select>
          <select value={obraFiltro} onChange={(e) => setObraFiltro(e.target.value)}>
            <option value="">Todas las obras</option>
            {[...obrasMap.entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <Tabla columns={columns} data={unidadesPaginadas} />
        {totalPaginas > 1 && (
          <div className="paginacion">
            <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>⬅</button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>➡</button>
          </div>
        )}
        <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
      </div>

      {unidadMantenimiento && <AsignarMantenimientoUnidad unidad={unidadMantenimiento} onClose={() => setUnidadMantenimiento(null)} onUpdated={handleUpdated} />}
      {unidadBaja && <BajaUnidadModal unidad={unidadBaja} onClose={() => setUnidadBaja(null)} onUpdated={handleUpdated} />}
      {unidadAsignar && <AsignarUnidadModal unidad={unidadAsignar} onClose={() => setUnidadAsignar(null)} onUpdated={handleUpdated} />}
      {unidadFecha && <AgregarFechaCompraModal unidad={unidadFecha} onClose={() => setUnidadFecha(null)} onUpdated={handleUpdated} />}

      {confirmMantenimientoUnidad && (
        <div className="modal-confirm-wrapper">
          <div className="modal-card">
            <h3>Unidad en mantenimiento</h3>
            <p>La unidad <strong>{confirmMantenimientoUnidad.identificador}</strong> está actualmente en mantenimiento.</p>
            <div className="acciones">
              <button className="btn-cancel" onClick={() => setConfirmMantenimientoUnidad(null)}>Cancelar</button>
              <button className="btn-asign" onClick={() => finalizarMantenimiento(confirmMantenimientoUnidad)}>Finalizar mantenimiento</button>
              <button className="btn-asign" onClick={() => { const id = confirmMantenimientoUnidad._id; setConfirmMantenimientoUnidad(null); onClose(); navigate(`/garantia/${id}`); }}>Ver garantía</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalUnidades;