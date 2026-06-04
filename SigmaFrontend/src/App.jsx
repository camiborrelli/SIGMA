import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

import Login from "./Componentes/Usuario/Login";
import Registro from "./Componentes/Usuario/Registro";

import MainLayout from "./Componentes/Layout/MainLayout";

import Dashboard from "./Componentes/Dashboard/Dashboard";
import ListadoGeneral from "./Componentes/Equipo/ListadoGeneral";

import RegistroObra from "./Componentes/Obra/RegistroObra";
import RegistrarEquipo from "./Componentes/Equipo/RegistrarEquipo";
import RegistrarUnidad from "./Componentes/Unidad/RegistrarUnidad";
import Garantia from "./Componentes/Unidad/Garantia";
import Mapa from "./Componentes/Mapa/Mapa";
import PerfilUsuario from "./Componentes/Usuario/PerfilUsuario";


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

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipos" element={<ListadoGeneral />} />
          <Route path="/registrarObra" element={<RegistroObra />} />
          <Route path="/registrarEquipo" element={<RegistrarEquipo />} />
          <Route path="/registrarUnidad" element={<RegistrarUnidad />} />
          <Route path="/garantia/:id" element={<Garantia />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;