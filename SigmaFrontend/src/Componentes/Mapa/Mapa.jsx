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
    const lista = document.querySelector(".lista-obras");
    if (lista) {
      lista.style.display = lista.style.display === "none" ? "block" : "none";
    }
  };

  return (
    <div className="mapa-container">
      <header>
        <h1>Mapa de Obras</h1>
        <div className="btn-group">
          <button className="hide" onClick={ocultarLista}>
            Ocultar lista
          </button>
          <button className="btn-home" onClick={() => navigate("/dashboard")}>
            Volver a inicio
          </button>
        </div>
      </header>

      <div
        className="filtros-listado"
        style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}
      >
        {typeof busquedaProp === "undefined" && (
          <input
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador"
          />
        )}

        {typeof estadoFilterProp === "undefined" && (
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {[...new Set(obras.map((o) => o.estado).filter(Boolean))].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        )}
      </div>

      <div className="content">
        <section className="lista-obras">
          <h2>Obras en el mapa</h2>
          {obrasFiltradas.map((obra) => (
            <div className="obra-card">
              <h3>{obra.nombre}</h3>
              <p>{obra.descripcion || "Sin descripción"}</p>
              <p>{obra.estado}</p>
            </div>
          ))}
        </section>
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
