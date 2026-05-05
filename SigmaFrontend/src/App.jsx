import { useState, useEffect } from "react";
import "./App.css";
import Login from "./Componentes/Usuario/Login";
import Registro from "./Componentes/Usuario/Registro";
import ListadoGeneral from "./Componentes/Maquinaria/ListadoGeneral";
import Dashboard from "./Componentes/Dashboard/Dashboard";
import RegistrarMaquinaria from "./Componentes/Maquinaria/RegistrarMaquinaria";
import Tabla from "./Componentes/Tabla";
import Garantia from "./Componentes/Maquinaria/Garantia";
import AsignarMantenimiento from "./Componentes/Maquinaria/AsignaraMantenimiento";
import { Routes, Route } from "react-router-dom";
import RegistroObra from "./Componentes/Obra/RegistroObra";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");
    if (token && user) {
      //mantener la sesion de usuario aunque se refresque la pagina
      setIsAuthenticated(true);
      setUsuario(JSON.parse(user));
    }
  }, []);

  return (
    <>
      <div className="bottom-nav">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registro />} />
          <Route path="/maquinaria" element={<ListadoGeneral />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/registrarMaquinaria"
            element={<RegistrarMaquinaria />}
          />
          <Route path="/garantia/:id" element={<Garantia />} />
          <Route
            path="/asignarMantenimiento/:id"
            element={<AsignarMantenimiento />}
          />
          <Route path="/registrarObra" element={<RegistroObra />} />
          <Route path="/tabla" element={<Tabla />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
