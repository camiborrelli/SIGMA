import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import "./Mapa.css";
import { useState, useEffect } from "react";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser } from "react-icons/fa";
import PerfilUsuario from "../Usuario/PerfilUsuario";
import Dashboard from "../Dashboard/Dashboard";

const Mapa = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [mostrarLista, setMostrarLista] = useState(true);
  const [obras, setObras] = useState([]);

  const [mostrarMapa, setMostrarMapa] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [mostrarGestion, setMostrarGestion] = useState(false);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchObras = async () => {
      try {
        const res = await fetch("http://localhost:5001/obras", { headers });
        if (!res.ok) return;
        const data = await res.json();
        setObras(data);
      } catch (err) {
        console.error("Error al obtener obras:", err);
      }
    };

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

  return (
    <>
      <div className="topbar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <span>SIGMA</span>
        </div>

        <nav className="nav">
          <button className="btn-nav" onClick={() => navigate("/dashboard")}>
            <VscTools /> Gestion de Equipos
          </button>
          <button className="btn-nav" onClick={() => navigate("/mapa")}>
            <TfiMapAlt /> Ver Mapa
          </button>
        </nav>

        <div className="topbar-right">
          <button
            className="btn-nav usuario"
            onClick={() => {
              setMostrarPerfil(true);
              setMostrarGestion(false);
              setMostrarMapa(false);
            }}
          >
            {" "}
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
          <header>
            <h1>Mapa de Obras</h1>
            <div className="btn-group">
              <button
                className="hide"
                onClick={() => setMostrarLista(!mostrarLista)}
              >
                {mostrarLista ? "Ocultar lista" : "Ver lista"}
              </button>
            </div>
          </header>

          <div className="filtros-listado">
            <input
              placeholder="Buscar obra, ubicación o responsable..."
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
              {[...new Set(obras.map((o) => o.estado).filter(Boolean))].map(
                (estado) => (
                  <button
                    key={estado}
                    className={`filtro-btn ${
                      estadoFilter === estado ? "active" : ""
                    }`}
                    onClick={() => setEstadoFilter(estado)}
                  >
                    {estado}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="content">
            {mostrarLista && (
              <section className="lista-obras">
                <h2>Obras en el mapa</h2>
                <p>{obrasFiltradas.length} obras encontradas</p>
                {obrasFiltradas.map((obra) => (
                  <div className="obra-card" key={obra._id}>
                    <div className="obra-card-header"></div>
                    <h3>{obra.nombre}</h3>
                    <p className="ubicacion">📍 {obra.ubicacion}</p>
                    <p className="fechas">
                      {obra.fechaInicio
                        ? new Date(obra.fechaInicio).toLocaleDateString("es-ES")
                        : "Sin fecha"}{" "}
                      -{" "}
                      {obra.fechaFin
                        ? new Date(obra.fechaFin).toLocaleDateString("es-ES")
                        : "Sin fecha"}
                    </p>
                    <div
                      className={`estado-badge estado-${obra.estado
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {obra.estado}
                    </div>
                  </div>
                ))}
              </section>
            )}

            <MapContainer
              center={[-34.7, -56.2]}
              zoom={10}
              style={{ height: "600px", width: "100%" }}
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
                    <span>📍 {obra.ubicacion}</span>
                    <br />
                    <span>
                      {obra.fechaInicio
                        ? new Date(obra.fechaInicio).toLocaleDateString("es-ES")
                        : "Sin fecha"}{" "}
                      -{" "}
                      {obra.fechaFin
                        ? new Date(obra.fechaFin).toLocaleDateString("es-ES")
                        : "Sin fecha"}
                    </span>
                    <br />
                    <span>{obra.estado}</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default Mapa;
