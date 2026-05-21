import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";
import "./Mapa.css";
import { useState, useEffect } from "react";

const Mapa = () => {
  const navigate = useNavigate();

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
        setObras(data); // data debería ser un array con {id, nombre, lat, lng, descripcion}
      } catch (err) {
        console.error("Error al obtener obras:", err);
      }
    };

    fetchObras();
  }, []);

  // Límites aproximados para Montevideo y Canelones
  const bounds = [
    [-35.1, -56.5], // suroeste
    [-34.3, -55.8], // noreste
  ];

  return (
    <div className="mapa-container">
      <button className="btn-home" onClick={() => navigate("/dashboard")}>
        Volver a inicio
      </button>
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
        {obras.map((obra) => (
          <Marker key={obra.id} position={[obra.latitud, obra.longitud]}>
            <Popup>
              <strong>{obra.nombre}</strong>
              <p>{obra.descripcion || "Sin descripción"}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Mapa;
