import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

import Login from "./Componentes/Usuario/Login";
import Registro from "./Componentes/Usuario/Registro";
import RestablecerContrasenia from "./Componentes/Usuario/RestablecerContrasenia";
import MainLayout from "./Componentes/Layout/MainLayout";
import Dashboard from "./Componentes/Dashboard/Dashboard";
import ListadoGeneral from "./Componentes/Equipo/ListadoGeneral";
import RegistroObra from "./Componentes/Obra/RegistroObra";
import RegistrarEquipo from "./Componentes/Equipo/RegistrarEquipo";
import RegistrarUnidad from "./Componentes/Unidad/RegistrarUnidad";
import Garantia from "./Componentes/Unidad/Garantia";
import GarantiasPorVencer from "./Componentes/Unidad/GarantiasPorVencer";
import Mapa from "./Componentes/Mapa/Mapa";
import PerfilUsuario from "./Componentes/Usuario/PerfilUsuario";
import ModalTokenExpirado from "./Componentes/Usuario/ModalTokenExpirado";
import GestionMantenimiento from "./Componentes/Unidad/GestionMantenimiento";
import DashboardGraficas from "./Componentes/Graficas/Grafica";

const tokenVigente = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [sesionExpirada, setSesionExpirada] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");

    if (tokenVigente(token) && user) {
      setIsAuthenticated(true);
      setUsuario(JSON.parse(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    }
  }, []);

  useEffect(() => {
    const manejarTokenExpirado = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setSesionExpirada(true);
      setIsAuthenticated(false);
      setUsuario(null);
    };

    window.addEventListener("token-expirado", manejarTokenExpirado);

    return () => {
      window.removeEventListener("token-expirado", manejarTokenExpirado);
    };
  }, []);

  return (
    <div className="app-main-root">
      <Toaster
        position="top-center"
        containerStyle={{
          top: 80,
          zIndex: 99999,
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registro />} />
        <Route
          path="/restablecer-contrasenia"
          element={<RestablecerContrasenia />}
        />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipos" element={<ListadoGeneral />} />
          <Route path="/registrarObra" element={<RegistroObra />} />
          <Route path="/registrarEquipo" element={<RegistrarEquipo />} />
          <Route path="/registrarUnidad" element={<RegistrarUnidad />} />
          <Route path="/garantia/:id" element={<Garantia />} />
          <Route path="/garantias-vencer" element={<GarantiasPorVencer />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route
            path="/gestion-mantenimiento"
            element={<GestionMantenimiento />}
          />
          <Route path="/graficas" element={<DashboardGraficas />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      {sesionExpirada && (
        <ModalTokenExpirado
          isOpen={sesionExpirada}
          onClose={() => setSesionExpirada(false)}
        />
      )}
    </div>
  );
}

export default App;
