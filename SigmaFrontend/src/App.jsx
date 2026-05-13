import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

// Auth
import Login from "./Componentes/Usuario/Login";
import Registro from "./Componentes/Usuario/Registro";

// Dashboard y principales
import Dashboard from "./Componentes/Dashboard/Dashboard";
import ListadoGeneral from "./Componentes/Equipo/ListadoGeneral";

// Otros
import RegistroObra from "./Componentes/Obra/RegistroObra";
import RegistrarEquipo from "./Componentes/Equipo/RegistrarEquipo";
import RegistrarUnidad from "./Componentes/Unidad/RegistrarUnidad";
import Garantia from "./Componentes/Unidad/Garantia";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");

    if (token && user) {
      setIsAuthenticated(true);
      setUsuario(JSON.parse(user));
    }
  }, []);

  return (
    <div className="bottom-nav">
      <Toaster position="top-center" />
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registro />} />

        {/* App */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipos" element={<ListadoGeneral />} />
        <Route path="/registrarObra" element={<RegistroObra />} />
        <Route path="/registrarEquipo" element={<RegistrarEquipo />} />
        <Route path="/registrarUnidad" element={<RegistrarUnidad />} />
        <Route path="/garantia/:id" element={<Garantia />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
