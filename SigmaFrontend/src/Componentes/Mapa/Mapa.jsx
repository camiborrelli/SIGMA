import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import "./Mapa.css";
import { useState, useEffect } from "react";

const Mapa = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [mostrarLista, setMostrarLista] = useState(true);

  const position = [-34.9011, -56.1645]; // Coordenadas del deposito de transamerican (temporal)
  const [obras, setObras] = useState([]);

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

  // Filtrar obras basado en búsqueda y estado
  const obrasFiltradas = obras.filter((obra) => {
    const coincideBusqueda = obra.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideEstado = !estadoFilter || obra.estado === estadoFilter;
    return coincideBusqueda && coincideEstado;
  });

  // Límites aproximados para Montevideo y Canelones
  const bounds = [
    [-35.1, -56.5], // suroeste
    [-34.3, -55.8], // noreste
  ];

  const ocultarLista = () => {
    setMostrarLista(!mostrarLista);
  };

  return (
    <div className="mapa-container">
      <header>
        <h1>Mapa de Obras</h1>
        <div className="btn-group">
          <button className="hide" onClick={ocultarLista}>
            {mostrarLista ? "Ocultar lista" : "Ver lista"}
          </button>
          <button className="btn-home" onClick={() => navigate("/dashboard")}>
            Volver a inicio
          </button>
        </div>
      </header>

      <div className="filtros-listado">
        {typeof busquedaProp === "undefined" && (
          <input
            placeholder="Buscar obra, ubicación o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador"
          />
        )}

        {typeof estadoFilterProp === "undefined" && (
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
        )}
      </div>

      <div className="content">
        {mostrarLista && (
          <section className="lista-obras">
            <h2>Obras en el mapa</h2>
            <p>{obrasFiltradas.length} obras encontradas</p>
            {obrasFiltradas.map((obra) => (
              <div className="obra-card" key={obra.id}>
                <div className="obra-card-header">
                  <div
                    className={`estado-badge estado-${obra.estado
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {obra.estado}
                  </div>
                </div>
                <h3>{obra.nombre}</h3>
                <p className="ubicacion">📍 {obra.ubicacion}</p>
                <p className="fechas">
                  {new Date(obra.fechaInicio).toLocaleDateString("es-ES")} -{" "}
                  {new Date(obra.fechaFin).toLocaleDateString("es-ES")}
                </p>
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
            <Marker key={obra.id} position={[obra.latitud, obra.longitud]}>
              <Popup>
                <strong>{obra.nombre}</strong>
                <p>{obra.descripcion || "Sin descripción"}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Mapa;
