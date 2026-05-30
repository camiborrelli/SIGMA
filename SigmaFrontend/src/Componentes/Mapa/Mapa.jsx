import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "./Mapa.css";
import { useState, useEffect } from "react";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser } from "react-icons/fa";
import { BsCalendarCheck, BsCalendarX } from "react-icons/bs";
import { FiTruck } from "react-icons/fi";
import { LuWrench, LuEye, LuEyeOff } from "react-icons/lu";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import PerfilUsuario from "../Usuario/PerfilUsuario";
import Dashboard from "../Dashboard/Dashboard";
import FinalizarObraModal from "../Obra/FinalizarObraModal";

const Mapa = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  const [detalleObra, setDetalleObra] = useState(null);
  const [mostrarLista, setMostrarLista] = useState(true);
  const [obras, setObras] = useState([]);
  
  // Estado para el menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarGestion, setMostrarGestion] = useState(false);
  const [verModalFinalizar, setVerModalFinalizar] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    usuario = null;
  }

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
    [-35.1, -56.5],
    [-34.3, -55.8],
  ];

  const seleccionarObra = async (obra) => {
    if (obra.estado?.toLowerCase() === "finalizada") {
      setObraSeleccionada(null);
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
        }
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
    if (est === "asignado") return <HiOutlineLocationMarker className="pill-icon" />;
    if (est === "mantenimiento" || est === "en mantenimiento") return <LuWrench className="pill-icon" />;
    if (est === "disponible") return <AiOutlineCheckCircle className="pill-icon" />;
    return <HiOutlineLocationMarker className="pill-icon" />;
  };

  const limpiarTextoUbicacion = (texto) => {
    if (!texto) return "";
    return texto.replace(/[📍📌]/g, "").trim();
  };

  return (
    <>
      <div className="topbar">
        {/* Botón hamburguesa para móvil */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>

        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>

        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          <button 
            className="btn-nav" 
            onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }}
          >
            <VscTools /> Gestión de Equipos
          </button>
          <button 
            className="btn-nav" 
            onClick={() => { navigate("/mapa"); setIsMenuOpen(false); }}
          >
            <TfiMapAlt /> Ver Mapa
          </button>
        </nav>

        <div className="topbar-right">
          <button
            className="btn-nav usuario"
            onClick={() => {
              setMostrarPerfil(true);
              setMostrarGestion(false);
              setIsMenuOpen(false);
            }}
          >
            <FaRegUser />
            {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario"}
          </button>
          <button className="btn-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {mostrarPerfil ? (
        <PerfilUsuario />
      ) : mostrarGestion ? (
        <Dashboard />
      ) : (
        <div className="mapa-container">
          <header className="mapa-header">
            <h1 className="mapa-titulo">Mapa de Obras</h1>
            <div className="btn-group">
              <button
                className="btn-ocultar-lista"
                onClick={() => setMostrarLista(!mostrarLista)}
              >
                {mostrarLista ? <LuEyeOff /> : <LuEye />}
                {mostrarLista ? "Ocultar lista" : "Mostrar lista"}
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
                className={`filtro-btn ${estadoFilter === "Activa" ? "active" : ""}`}
                onClick={() => setEstadoFilter("Activa")}
              >
                Activa
              </button>
              <button
                className={`filtro-btn ${estadoFilter === "Finalizada" ? "active" : ""}`}
                onClick={() => setEstadoFilter("Finalizada")}
              >
                Finalizada
              </button>
              <button
                className={`filtro-btn ${estadoFilter === "Cancelada" ? "active" : ""}`}
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
                <p className="conteo-obras-sub">{obrasFiltradas.length} obras encontradas</p>
                
                <div className="lista-scroll-contenedor">
                  {obrasFiltradas.map((obra) => {
                    const esSeleccionada = obraSeleccionada?._id === obra._id;
                    const claseEstado = obra.estado?.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <div 
                        className={`obra-card ${esSeleccionada ? "selected" : ""}`} 
                        key={obra._id} 
                        onClick={() => seleccionarObra(obra)}
                      >
                        <h3>{obra.nombre}</h3>
                        <p className="ubicacion">{limpiarTextoUbicacion(obra.ubicacion)}</p>
                        <p className="fechas">
                          {obra.fechaInicio
                            ? new Date(obra.fechaInicio).toLocaleDateString("es-ES")
                            : "Sin fecha"}{" "}
                          -{" "}
                          {obra.fechaFin
                            ? new Date(obra.fechaFin).toLocaleDateString("es-ES")
                            : "Sin fecha"}
                        </p>
                        <div className="estado-badge-wrapper">
                          <span className={`estado-badge estado-${claseEstado}`}>
                            {obra.estado}
                          </span>
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
                  <Marker key={obra._id} position={[obra.latitud, obra.longitud]}>
                    <Popup>
                      <strong>{obra.nombre}</strong>
                      <br />
                      <span>{limpiarTextoUbicacion(obra.ubicacion)}</span>
                      <br />
                      <span>{obra.estado}</span>
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
                    <p className="detalle-ubicacion">{limpiarTextoUbicacion(detalleObra.ubicacion)}</p>
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
                      <span className="numero">{detalleObra.maquinas?.length ?? 0}</span>
                      <span className="label-stat"> Máquinas</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon-circle h-icon">🧰</span>
                    <div className="stat-meta">
                      <span className="numero">{detalleObra.herramientas?.length ?? 0}</span>
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
                        ? new Date(detalleObra.fechaInicio).toLocaleDateString("es-ES")
                        : "-"}
                    </span>
                  </div>

                  <div className="fecha-item-row">
                    <BsCalendarX className="fecha-icon-svg" />
                    <span className="label-fecha">Fin estimado:</span>
                    <span className="valor-fecha">
                      {detalleObra.fechaFin
                        ? new Date(detalleObra.fechaFin).toLocaleDateString("es-ES")
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="seccion-equipos">
                  <h3>Máquinas Asignadas</h3>
                  {detalleObra.maquinas?.length > 0 ? (
                    detalleObra.maquinas.map((unidad) => {
                      const claseEstado = (unidad.estado || "asignado").toLowerCase().replace(/\s+/g, "-");
                      return (
                        <div className="equipo-card" key={unidad._id}>
                          <div className="equipo-circle-avatar">
                            <FiTruck className="equipo-svg" />
                          </div>
                          <div className="equipo-detalles-texto">
                            <strong>{unidad.nombreEquipo || "Máquina"}</strong>
                            <p>{unidad.identificador || unidad.modelo || "Sin código"}</p>
                          </div>
                          <span className={`estado-equipo-pill status-${claseEstado}`}>
                            {renderIconoEstadoEquipo(unidad.estado || "Asignado")}
                            {unidad.estado || "Asignado"}
                          </span>
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
                      const claseEstado = (unidad.estado || "asignado").toLowerCase().replace(/\s+/g, "-");
                      return (
                        <div className="equipo-card" key={unidad._id}>
                          <div className="equipo-circle-avatar">
                            <LuWrench className="equipo-svg" />
                          </div>
                          <div className="equipo-detalles-texto">
                            <strong>{unidad.nombreEquipo || "Herramienta"}</strong>
                            <p>{unidad.identificador || unidad.modelo || "Sin código"}</p>
                          </div>
                          <span className={`estado-equipo-pill status-${claseEstado}`}>
                            {renderIconoEstadoEquipo(unidad.estado || "Asignado")}
                            {unidad.estado || "Asignado"}
                          </span>
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
                </div>
              </section>
            )}
          </div>
        </div>
      )}

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
    </>
  );
};

export default Mapa;