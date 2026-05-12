import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import ModalUnidades from "../Unidad/ModalUnidades";
import Buscador from "../Usuario/Buscador";
import "./ListadoGeneral.css";

const ListadoGeneral = ({ onUpdated }) => {
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(6);

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
        setEquipos(data);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const equiposFiltrados = equipos.filter((e) => {
    const texto = `${e.nombre} ${e.modelo} ${e.tipo}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.ceil(equiposFiltrados.length / porPagina);
  const indiceInicio = (paginaActual - 1) * porPagina;
  const indiceFin = indiceInicio + porPagina;
  const equiposPaginados = equiposFiltrados.slice(indiceInicio, indiceFin);

  const columns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Modelo", accessor: "modelo" },
    { header: "Tipo", accessor: "tipo" },
    {
      header: "Acciones",
      accessor: (row) => (
        <button
          className="btn-ver"
          onClick={() => setEquipoSeleccionado(row)}
        >
          Ver unidades
        </button>
      ),
    }
  ];

  return (
    <div className="equipos-container">
      <h2 className="titulo">Listado de equipos</h2>

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
    onUpdated={onUpdated} // ✅ Esto funcionará si ListadoGeneral recibe `onUpdated` como prop
  />
)}
    </div>
  );
};

export default ListadoGeneral;