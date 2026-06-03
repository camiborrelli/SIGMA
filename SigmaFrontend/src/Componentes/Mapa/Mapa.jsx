import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Mapa.css";
import { useState, useEffect } from "react";
import { BsCalendarCheck, BsCalendarX } from "react-icons/bs";
import { FiTruck, FiRefreshCcw, FiCheck } from "react-icons/fi"; // Agregado FiCheck
import { LuWrench, LuEye, LuEyeOff } from "react-icons/lu";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import FinalizarObraModal from "../Obra/FinalizarObraModal";
import TrasladarUnidadesModal from "../Obra/TrasladarUnidadesModal";
import ReactivarObraModal from "../Obra/ReactivarObraModal";
import toast from "react-hot-toast";
import { CiCircleRemove } from "react-icons/ci";

const Mapa = () => {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [detalleObra, setDetalleObra] = useState(null);
  const [mostrarLista, setMostrarLista] = useState(true);
  const [obras, setObras] = useState([]);
  const [verModalFinalizar, setVerModalFinalizar] = useState(false);
  const [removingIds, setRemovingIds] = useState([]);
  const [trasladarEquiposModal, setTrasladarEquiposModal] = useState(false);
  const [verModalReactivar, setVerModalReactivar] = useState(false);
  const [obraAReactivar, setObraAReactivar] = useState(null);

  const fetchObras = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch("http://localhost:5001/obras", { headers });
      if (!res.ok) return;
      const data = await res.json();
      setObras(data);
    } catch (err) {
      console.error("Error al obtener obras:", err);
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const obrasFiltradas = obras.filter((obra) => {
    const coincideBusqueda = obra.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideEstado = !estadoFilter || obra.estado === estadoFilter;
    return coincideBusqueda && coincideEstado;
  });
  const bounds = [
    [-35.9, -58.5],
    [-30.0, -53.0],
  ];

  const seleccionarObra = async (obra) => {
    if (obra.estado?.toLowerCase() === "finalizada") {
      // Mantenemos la lógica actual para que se seleccione visualmente pero limpie el panel derecho si aplica
      setObraSeleccionada(obra);
      setDetalleObra(null);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5001/obras/detalle/${obra._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) return;
      const data = await res.json();

      setObraSeleccionada(obra);
      setDetalleObra(data);
    } catch (error) {
      console.error(error);
    }
  };

  const renderIconoEstadoEquipo = (estado) => {
    const est = estado?.toLowerCase();
    if (est === "asignado")
      return <HiOutlineLocationMarker className="pill-icon" />;
    if (est === "mantenimiento" || est === "en mantenimiento")
      return <LuWrench className="pill-icon" />;
    if (est === "disponible")
      return <AiOutlineCheckCircle className="pill-icon" />;
    return <HiOutlineLocationMarker className="pill-icon" />;
  };

  const limpiarTextoUbicacion = (texto) => {
    if (!texto) return "";
    return texto.replace(/[📍📌]/g, "").trim();
  };

  const quitarUnidad = async (unidadId) => {
    setRemovingIds((p) => (p.includes(unidadId) ? p : [...p, unidadId]));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5001/unidades/quitar-de-obra/${unidadId}/${detalleObra._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const bodyErr = await res.json().catch(() => ({}));
        toast.error(bodyErr.error || "Error al quitar unidad de la obra");
        return;
      }

      toast.success("Unidad quitada de la obra");

      const detalleRes = await fetch(
        `http://localhost:5001/obras/detalle/${detalleObra._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (detalleRes.ok) {
        const detalleData = await detalleRes.json();
        setDetalleObra(detalleData);
      }

      await fetchObras();
    } catch (error) {
      toast.error("Error al quitar unidad de la obra");
      console.error("Error al quitar unidad:", error);
    } finally {
      setRemovingIds((p) => p.filter((id) => id !== unidadId));
    }
  };

  return (
    <>
      <div className="mapa-container">
        <header className="mapa-header">
          <h1 className="mapa-titulo">Mapa de Obras</h1>
          <div className="btn-group">
            <button
              className="btn-ocultar-lista"
              onClick={() => setMostrarLista(!mostrarLista)}
            >
              {mostrarLista ? <LuEyeOff /> : <LuEye />}
              {mostrarLista ? "Ocultar obras" : "Mostrar obras"}
            </button>
          </div>
        </header>

        <div className="filtros-listado">
          <input
            placeholder="🔍 Buscar obra o ubicación"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador"
          />

          <div className="filtros-estado">
            <button
              className={`filtro-btn ${!estadoFilter ? "active" : ""}`}
              onClick={() => setEstadoFilter("")}
            >
              Todos
            </button>
            <button
              className={`filtro-btn ${
                estadoFilter === "Activa" ? "active" : ""
              }`}
              onClick={() => setEstadoFilter("Activa")}
            >
              Activa
            </button>
            <button
              className={`filtro-btn ${
                estadoFilter === "Finalizada" ? "active" : ""
              }`}
              onClick={() => setEstadoFilter("Finalizada")}
            >
              Finalizada
            </button>
            <button
              className={`filtro-btn ${
                estadoFilter === "Cancelada" ? "active" : ""
              }`}
              onClick={() => setEstadoFilter("Cancelada")}
            >
              Cancelada
            </button>
          </div>
        </div>

        <div className="content">
          {mostrarLista && (
            <section className="lista-obras">
              <h2>Obras en el mapa</h2>
              <p className="conteo-obras-sub">
                {obrasFiltradas.length} obras encontradas
              </p>

              <div className="lista-scroll-contenedor">
                {obrasFiltradas.map((obra) => {
                  const esSeleccionada = obraSeleccionada?._id === obra._id;
                  const claseEstado = obra.estado
                    ?.toLowerCase()
                    .replace(/\s+/g, "-");
                  const esInactivaCard =
                    obra.estado?.toLowerCase() === "finalizada" ||
                    obra.estado?.toLowerCase() === "cancelada";

                  return (
                    <div
                      className={`obra-card ${
                        esSeleccionada ? "selected" : ""
                      }`}
                      key={obra._id}
                      onClick={() => seleccionarObra(obra)}
                    >
                      <h3>{obra.nombre}</h3>

                      {/* Fila de Ubicación con Icono */}
                      <p className="ubicacion">
                        <HiOutlineLocationMarker className="card-icon-svg loc-icon" />
                        {limpiarTextoUbicacion(obra.ubicacion)}
                      </p>

                      {/* Fila de Fechas con Icono */}
                      <p className="fechas">
                        <BsCalendarCheck className="card-icon-svg date-icon" />
                        {obra.fechaInicio
                          ? new Date(obra.fechaInicio).toLocaleDateString(
                              "es-ES",
                            )
                          : "Sin fecha"}{" "}
                        •{" "}
                        {obra.fechaFin
                          ? new Date(obra.fechaFin).toLocaleDateString("es-ES")
                          : "Sin fecha"}
                      </p>

                      <div className="estado-badge-wrapper">
                        {/* Badge dinámico con Check icon si está Finalizada */}
                        <span className={`estado-badge estado-${claseEstado}`}>
                          {obra.estado?.toLowerCase() === "finalizada" && (
                            <span className="badge-tick-circle">
                              <FiCheck />
                            </span>
                          )}
                          {obra.estado}
                        </span>

                        {/* Botón Reactivar Estilizado como la Imagen */}
                        {esInactivaCard && (
                          <button
                            className="btn-reactivar-sutil-box"
                            title="Reactivar obra"
                            onClick={(e) => {
                              e.stopPropagation();
                              setObraAReactivar(obra);
                              setVerModalReactivar(true);
                            }}
                          >
                            <FiRefreshCcw />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mapa-wrapper">
            <MapContainer
              center={[-34.7, -56.2]}
              zoom={10}
              style={{ height: "100%", width: "100%", minHeight: "450px" }}
              maxBounds={bounds}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {obrasFiltradas.map((obra) => (
                <Marker
                  key={obra._id}
                  position={[obra.latitud, obra.longitud]}
                  eventHandlers={{ click: () => seleccionarObra(obra) }}
                />
              ))}
            </MapContainer>
          </div>

          {detalleObra && (
            <section className="detalle-obra">
              <div className="detalle-top">
                <div className="detalle-info">
                  <h2>{detalleObra.nombre}</h2>
                  <p className="detalle-ubicacion">
                    {limpiarTextoUbicacion(detalleObra.ubicacion)}
                  </p>
                  <span
                    className={`estado-badge estado-${detalleObra.estado
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {detalleObra.estado}
                  </span>
                </div>

                <button
                  className="btn-cerrar-detalle"
                  onClick={() => {
                    setDetalleObra(null);
                    setObraSeleccionada(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon-circle m-icon">🔧</span>
                  <div className="stat-meta">
                    <span className="numero">
                      {detalleObra.maquinas?.length ?? 0}
                    </span>
                    <span className="label-stat"> Máquinas</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon-circle h-icon">🧰</span>
                  <div className="stat-meta">
                    <span className="numero">
                      {detalleObra.herramientas?.length ?? 0}
                    </span>
                    <span className="label-stat"> Herramientas</span>
                  </div>
                </div>
              </div>

              <div className="info-obra-fechas-box">
                <div className="fecha-item-row">
                  <BsCalendarCheck className="fecha-icon-svg" />
                  <span className="label-fecha">Inicio:</span>
                  <span className="valor-fecha">
                    {detalleObra.fechaInicio
                      ? new Date(detalleObra.fechaInicio).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </span>
                </div>

                <div className="fecha-item-row">
                  <BsCalendarX className="fecha-icon-svg" />
                  <span className="label-fecha">Fin estimado:</span>
                  <span className="valor-fecha">
                    {detalleObra.fechaFin
                      ? new Date(detalleObra.fechaFin).toLocaleDateString(
                          "es-ES",
                        )
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="seccion-equipos">
                <h3>Máquinas Asignadas</h3>
                {detalleObra.maquinas?.length > 0 ? (
                  detalleObra.maquinas.map((unidad) => {
                    const claseEstado = (unidad.estado || "asignado")
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    return (
                      <div className="equipo-card" key={unidad._id}>
                        <div className="equipo-circle-avatar">
                          <FiTruck className="equipo-svg" />
                        </div>
                        <div className="equipo-detalles-texto">
                          <strong>{unidad.nombreEquipo || "Máquina"}</strong>
                          <p>
                            {unidad.identificador ||
                              unidad.modelo ||
                              "Sin código"}
                          </p>
                        </div>
                        <span
                          className={`estado-equipo-pill status-${claseEstado}`}
                        >
                          {renderIconoEstadoEquipo(unidad.estado || "Asignado")}
                          {unidad.estado || "Asignado"}
                        </span>
                        <button onClick={() => quitarUnidad(unidad._id)}>
                          <CiCircleRemove
                            style={{ fontSize: "1.25rem", color: "#c0392b" }}
                            alt="Quitar máquina"
                          />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="sin-datos">No hay máquinas asignadas.</p>
                )}
              </div>

              <div className="seccion-equipos">
                <h3>Herramientas Asignadas</h3>
                {detalleObra.herramientas?.length > 0 ? (
                  detalleObra.herramientas.map((unidad) => {
                    const claseEstado = (unidad.estado || "asignado")
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    return (
                      <div className="equipo-card" key={unidad._id}>
                        <div className="equipo-circle-avatar">
                          <LuWrench className="equipo-svg" />
                        </div>
                        <div className="equipo-detalles-texto">
                          <strong>
                            {unidad.nombreEquipo || "Herramienta"}
                          </strong>
                          <p>
                            {unidad.identificador ||
                              unidad.modelo ||
                              "Sin código"}
                          </p>
                        </div>
                        <span
                          className={`estado-equipo-pill status-${claseEstado}`}
                        >
                          {renderIconoEstadoEquipo(unidad.estado || "Asignado")}
                          {unidad.estado || "Asignado"}
                        </span>
                        <button onClick={() => quitarUnidad(unidad._id)}>
                          <CiCircleRemove
                            className="equipo-svg"
                            style={{ fontSize: "1.25rem", color: "#c0392b" }}
                            alt="Quitar herramienta"
                          />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="sin-datos">No hay herramientas asignadas.</p>
                )}
              </div>

              <div className="detalle-acciones">
                <button
                  className="btn-finalizar-obra"
                  onClick={() => setVerModalFinalizar(true)}
                >
                  Finalizar Obra
                </button>

                <button
                  onClick={() => setTrasladarEquiposModal(true)}
                  className="btn-exportar-equipos"
                >
                  Trasladar equipos
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {verModalFinalizar && detalleObra && (
        <FinalizarObraModal
          obra={detalleObra}
          onClose={() => setVerModalFinalizar(false)}
          onUpdated={async () => {
            setDetalleObra(null);
            setObraSeleccionada(null);
            await fetchObras();
          }}
        />
      )}

      <TrasladarUnidadesModal
        isOpen={trasladarEquiposModal}
        onClose={() => setTrasladarEquiposModal(false)}
        obraOrigen={detalleObra}
        obras={obras}
        onSuccess={async () => {
          setTrasladarEquiposModal(false);
          setObraSeleccionada(null);
          setDetalleObra(null);
          await fetchObras();
        }}
      />

      <ReactivarObraModal
        isOpen={verModalReactivar}
        obra={obraAReactivar}
        onClose={() => {
          setVerModalReactivar(false);
          setObraAReactivar(null);
        }}
        onUpdated={async () => {
          setDetalleObra(null);
          setObraSeleccionada(null);
          await fetchObras();
        }}
      />
    </>
  );
};

export default Mapa;
