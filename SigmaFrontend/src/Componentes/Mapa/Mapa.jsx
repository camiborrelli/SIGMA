import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import toast from "react-hot-toast";
import { BsCalendarCheck, BsCalendarX } from "react-icons/bs";
import {
  FiTruck,
  FiRefreshCcw,
  FiCheck,
  FiArrowLeft,
  FiBox,
  FiChevronRight,
} from "react-icons/fi";
import { LuWrench, LuEye, LuEyeOff } from "react-icons/lu";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FiXCircle } from "react-icons/fi";
import FinalizarObraModal from "../Obra/FinalizarObraModal";
import TrasladarUnidadesModal from "../Obra/TrasladarUnidadesModal";
import ReactivarObraModal from "../Obra/ReactivarObraModal";
import "leaflet/dist/leaflet.css";
import "./Mapa.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import EditarObraModal from "../Obra/EditarObraModal";
import { FaEdit } from "react-icons/fa";
import { API_URL } from "../../../api";
import RemoverUnidadesModal from "../Unidad/RemoverUnidadesModal";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { CiCircleRemove } from "react-icons/ci";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Mapa = () => {
  const [busqueda, setBusqueda] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [mostrarLista, setMostrarLista] = useState(true);
  const [obras, setObras] = useState([]);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [detalleObra, setDetalleObra] = useState(null);
  const [verModalFinalizar, setVerModalFinalizar] = useState(false);
  const [trasladarEquiposModal, setTrasladarEquiposModal] = useState(false);
  const [verModalReactivar, setVerModalReactivar] = useState(false);
  const [obraAReactivar, setObraAReactivar] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);
  const [verModalEditarObra, setVerModalEditarObra] = useState(false);
  const [verModalRemoverUnidades, setVerModalRemoverUnidades] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const bounds = [
    [-35.9, -58.5],
    [-30.0, -53.0],
  ];

  const fetchObras = async () => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${API_URL}/obras`, { headers });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) return;
      const data = await res.json();
      setObras(data);
    } catch (err) {
      console.error("Error al obtener obras:", err);
      toast.error("No se pudo cargar el listado de obras");
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    if (detalleObra) {
      fetchEquipos();
      setEquipoSeleccionado(null);
    } else {
      setEquipos([]);
      setEquipoSeleccionado(null);
    }
  }, [detalleObra?._id]);

  const obrasFiltradas = obras.filter((obra) => {
    const termino = busqueda.toLowerCase();
    const coincideNombre = obra.nombre?.toLowerCase().includes(termino);
    const coincideUbicacion = obra.ubicacion?.toLowerCase().includes(termino);
    const coincideBusqueda = coincideNombre || coincideUbicacion;

    const coincideEstado = !estadoFilter || obra.estado === estadoFilter;
    return coincideBusqueda && coincideEstado;
  });

  const seleccionarObra = async (obra) => {
    if (obra.estado?.toLowerCase() === "finalizada") {
      setObraSeleccionada(obra);
      setDetalleObra(null);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/obras/detalle/${obra._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) return;
      const data = await res.json();

      setObraSeleccionada(obra);
      setDetalleObra(data);
    } catch (error) {
      console.error("Error al obtener detalle de obra:", error);
    }
  };

  const quitarUnidad = async (unidadId) => {
    if (removingIds.includes(unidadId)) return;
    setRemovingIds((prev) => [...prev, unidadId]);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/unidades/quitar-de-obra/${unidadId}/${detalleObra._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) {
        const bodyErr = await res.json().catch(() => ({}));
        toast.error(bodyErr.error || "Error al quitar unidad de la obra");
        return;
      }

      toast.success("Unidad quitada de la obra");

      const detalleRes = await fetch(
        `${API_URL}/obras/detalle/${detalleObra._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (detalleRes.ok) {
        const detalleData = await detalleRes.json();
        setDetalleObra(detalleData);
      }

      await fetchObras();
    } catch (error) {
      toast.error("Error al quitar unidad de la obra");
      console.error("Error al quitar unidad:", error);
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== unidadId));
    }
  };

  const renderIconoEstadoEquipo = (estado) => {
    const est = estado?.toLowerCase();
    if (est === "asignado" || est === "asignada")
      return <HiOutlineLocationMarker className="pill-icon" />;
    if (est === "mantenimiento" || est === "en mantenimiento")
      return <LuWrench className="pill-icon" />;
    if (est === "disponible")
      return <AiOutlineCheckCircle className="pill-icon" />;
    return <HiOutlineLocationMarker className="pill-icon" />;
  };

  const limpiarTextoUbicacion = (texto) => {
    if (!texto) return "";
    return texto.replace(/[📍📌]/gu, "").trim();
  };

  const fetchEquipos = async () => {
    setCargandoEquipos(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/equipos/obra/${detalleObra._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error("No se pudieron obtener los equipos de la obra");
      }

      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al obtener equipos");
    } finally {
      setCargandoEquipos(false);
    }
  };

  //filtrar unidades segun el equipo seleccionado
  const todasLasUnidades = [
    ...(detalleObra?.maquinas || []).map((u) => ({
      ...u,
      tipoUnidad: "maquina",
    })),
    ...(detalleObra?.herramientas || []).map((u) => ({
      ...u,
      tipoUnidad: "herramienta",
    })),
  ];

  // console.log("todasLasUnidades", todasLasUnidades);
  // console.log("equipo seleccionado", equipoSeleccionado);

  const unidadesDelEquipoSeleccionado = equipoSeleccionado
    ? todasLasUnidades.filter(
        (u) =>
          u.equipoId === equipoSeleccionado.id ||
          u.nombreEquipo === equipoSeleccionado.nombre,
      )
    : [];

  const iconosEstado = {
    "": <AiOutlineUnorderedList />,
    Activa: <IoIosCheckmarkCircleOutline />,
    Finalizada: <FiCheck />,
    Cancelada: <CiCircleRemove />,
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
            {["", "Activa", "Finalizada", "Cancelada"].map((estado) => (
              <button
                key={estado}
                className={`filtro-btn ${
                  estadoFilter === estado ? "active" : ""
                }`}
                onClick={() => setEstadoFilter(estado)}
              >
                {iconosEstado[estado]}
                {estado === "" ? "Todos" : estado}
              </button>
            ))}
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

                      <p className="ubicacion">
                        <HiOutlineLocationMarker className="card-icon-svg loc-icon" />
                        {limpiarTextoUbicacion(obra.ubicacion)}
                      </p>

                      <p className="fechas">
                        <BsCalendarCheck className="card-icon-svg date-icon" />
                        {obra.fechaInicio
                          ? new Date(obra.fechaInicio).toLocaleDateString(
                              "es-ES",
                              {
                                timeZone: "UTC",
                              },
                            )
                          : "Sin fecha"}{" "}
                        -{" "}
                        {obra.fechaFin
                          ? new Date(obra.fechaFin).toLocaleDateString(
                              "es-ES",
                              {
                                timeZone: "UTC",
                              },
                            )
                          : "Sin fecha"}
                      </p>

                      <div className="estado-badge-wrapper">
                        <span className={`estado-badge estado-${claseEstado}`}>
                          {obra.estado?.toLowerCase() === "finalizada" && (
                            <span className="badge-tick-circle">
                              <FiCheck />
                            </span>
                          )}
                          {obra.estado}
                        </span>{" "}
                        {usuario?.rol === "Admin" && (
                          <div className="acciones-admin">
                            <button
                              className="btn-editar-obra"
                              onClick={(e) => {
                                e.stopPropagation();
                                seleccionarObra(obra);
                                setVerModalEditarObra(true);
                              }}
                            >
                              <FaEdit />
                            </button>

                            {/* <button
                              className="btn-eliminar-obra"
                              onClick={(e) => {
                                e.stopPropagation();
                                setObraAEliminar(obra);
                                setVerModalEliminar(true);
                              }}
                            >
                              <FaTrash />
                            </button> */}

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
              {obrasFiltradas
                .filter((o) => o.latitud && o.longitud)
                .map((obra) => (
                  <Marker
                    key={obra._id}
                    position={[obra.latitud, obra.longitud]}
                    eventHandlers={{ click: () => seleccionarObra(obra) }}
                  >
                    <Popup>
                      <div style={{ fontSize: "14px" }}>
                        <strong>{obra.nombre}</strong> <br />
                        <span>Estado: {obra.estado}</span>
                      </div>
                    </Popup>
                  </Marker>
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
                          {
                            timeZone: "UTC",
                          },
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
                          {
                            timeZone: "UTC",
                          },
                        )
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="listado-equipos">
                <h3>Listado de equipos</h3>

                {equipoSeleccionado ? (
                  <>
                    <button
                      type="button"
                      className="btn-volver-equipos"
                      onClick={() => setEquipoSeleccionado(null)}
                    >
                      <FiArrowLeft />
                      <span>Volver a equipos</span>
                    </button>

                    <h4 className="equipo-detalle-titulo">
                      {equipoSeleccionado.nombre}
                    </h4>

                    {unidadesDelEquipoSeleccionado.length > 0 ? (
                      unidadesDelEquipoSeleccionado.map((unidad) => {
                        const estadoUnidad = unidad.estado || "Asignada";
                        const etiquetaEstado =
                          estadoUnidad.toLowerCase() === "asignado"
                            ? "Asignada"
                            : estadoUnidad;
                        const claseEstado = estadoUnidad
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        const estaEliminando = removingIds.includes(unidad._id);

                        return (
                          <div
                            className="equipo-card unidad-card-detalle"
                            key={unidad._id}
                          >
                            <div className="equipo-circle-avatar">
                              {unidad.tipoUnidad === "maquina" ? (
                                <FiTruck className="equipo-svg" />
                              ) : (
                                <LuWrench className="equipo-svg" />
                              )}
                            </div>
                            <div className="equipo-detalles-texto">
                              <strong>
                                {unidad.identificador || "Sin código"}
                              </strong>
                              <p>{unidad.modelo || "Sin modelo"}</p>
                            </div>
                            <span
                              className={`estado-equipo-pill status-${claseEstado}`}
                            >
                              {renderIconoEstadoEquipo(estadoUnidad)}
                              {etiquetaEstado}
                            </span>
                            {usuario?.rol === "Admin" && (
                              <button
                                type="button"
                                onClick={() => quitarUnidad(unidad._id)}
                                disabled={estaEliminando}
                                className="btn-quitar-unidad"
                              >
                                {estaEliminando ? (
                                  <FiRefreshCcw
                                    className="spinner"
                                    style={{
                                      animation: "spin 1s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <FiXCircle title="Quitar unidad" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="sin-datos">
                        Este equipo no tiene unidades en esta obra.
                      </p>
                    )}
                  </>
                ) : cargandoEquipos ? (
                  <p className="cargando-equipos">Cargando equipos...</p>
                ) : (
                  equipos.map((equipo) => {
                    const cantidadUnidades = Number(equipo.stock) || 0;

                    return (
                      <button
                        type="button"
                        className="equipo-card equipo-card-clickable"
                        key={equipo.id}
                        onClick={() => setEquipoSeleccionado(equipo)}
                      >
                        <div className="equipo-circle-avatar">
                          {equipo.tipo === "maquina" ? (
                            <FiTruck className="equipo-svg" />
                          ) : (
                            <LuWrench className="equipo-svg" />
                          )}
                        </div>
                        <div className="equipo-detalles-texto">
                          <strong>{equipo.nombre}</strong>
                          <p>{equipo.modelo || "Sin modelo"}</p>
                        </div>
                        <span className="equipo-card-count">
                          <FiBox />
                          {cantidadUnidades}{" "}
                          {cantidadUnidades === 1 ? "unidad" : "unidades"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* <div className="seccion-equipos">
                <h3>Máquinas Asignadas</h3>
                {detalleObra.maquinas?.length > 0 ? (
                  detalleObra.maquinas.map((unidad) => {
                    const claseEstado = (unidad.estado || "asignado")
                      .toLowerCase()
                      .replace(/\s+/g, "-");
                    const estaEliminando = removingIds.includes(unidad._id);

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
                        {usuario?.rol === "Admin" && (
                          <>
                            <button
                              onClick={() => quitarUnidad(unidad._id)}
                              disabled={estaEliminando}
                              className="btn-quitar-unidad"
                            >
                              {estaEliminando ? (
                                <FiRefreshCcw
                                  className="spinner"
                                  style={{
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <CiCircleRemove
                                  style={{
                                    fontSize: "1.25rem",
                                    color: "#c0392b",
                                  }}
                                  title="Quitar máquina"
                                />
                              )}
                            </button>
                          </>
                        )}
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
                    const estaEliminando = removingIds.includes(unidad._id);

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
                        <button
                          onClick={() => quitarUnidad(unidad._id)}
                          disabled={estaEliminando}
                          className="btn-quitar-unidad"
                        >
                          {estaEliminando ? (
                            <FiRefreshCcw
                              className="spinner"
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <CiCircleRemove
                              style={{ fontSize: "1.25rem", color: "#c0392b" }}
                              title="Quitar herramienta"
                            />
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="sin-datos">No hay herramientas asignadas.</p>
                )}
              </div> */}

              <div className="detalle-acciones">
                {usuario?.rol === "Admin" && (
                  <button
                    className="btn-removerUnidades"
                    onClick={() => setVerModalRemoverUnidades(true)}
                  >
                    Remover unidades
                  </button>
                )}
                {usuario?.rol === "Admin" && (
                  <button
                    className="btn-finalizar-obra"
                    onClick={() => setVerModalFinalizar(true)}
                  >
                    Finalizar Obra
                  </button>
                )}

                <button
                  onClick={() => setTrasladarEquiposModal(true)}
                  className="btn-exportar-equipos"
                >
                  {usuario?.rol === "Admin"
                    ? "Trasladar equipos"
                    : "Solicitar traslado"}
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
        rolUsuario={usuario?.rol}
        onSuccess={async () => {
          setTrasladarEquiposModal(false);
          setObraSeleccionada(null);
          setDetalleObra(null);
          await fetchObras();
        }}
      />

      {verModalEditarObra && detalleObra && (
        <EditarObraModal
          obra={detalleObra}
          onClose={() => setVerModalEditarObra(false)}
          onUpdated={async () => {
            setDetalleObra(null);
            setObraSeleccionada(null);
            await fetchObras();
          }}
        />
      )}

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
      {verModalRemoverUnidades && detalleObra && (
        <RemoverUnidadesModal
          isOpen={verModalRemoverUnidades}
          obra={detalleObra}
          onClose={() => setVerModalRemoverUnidades(false)}
          onUpdated={async () => {
            setDetalleObra(null);
            setObraSeleccionada(null);
            await fetchObras();
          }}
        />
      )}
    </>
  );
};

export default Mapa;
