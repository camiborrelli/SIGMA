import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./CambiarContrasenia.css";
import "./PerfilUsuario.css";
import CambiarContrasenia from "./CambiarContrasenia";
import { TbLockPassword } from "react-icons/tb";
import Mapa from "../Mapa/Mapa";
import Dashboard from "../Dashboard/Dashboard";

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [mostrarCambiarContrasenia, setMostrarCambiarContrasenia] =
    useState(false);

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(true);
  const [mostrarGestion, setMostrarGestion] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUsuario(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error al cargar usuario:", e);
      setUsuario(null);
    }
  }, []);

  return (
    <>
      {mostrarMapa ? (
        <Mapa />
      ) : mostrarGestion ? (
        <Dashboard />
      ) : (
        <div className="perfil-usuario-container">
          <div className="card-usuario">
            {usuario ? (
              <>
                <div className="usuario-header">
                  <div className="usuario-avatar">
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </div>

                  <h2 className="usuario-titulo">{usuario.nombre}</h2>

                  <p className="usuario-subtitulo">Información del usuario</p>
                </div>

                <div className="usuario-info">
                  <div className="usuario-item">
                    <span className="usuario-label">Nombre</span>
                    <span className="usuario-value">{usuario.nombre}</span>
                  </div>

                  <div className="usuario-item">
                    <span className="usuario-label">Email</span>
                    <span className="usuario-value">{usuario.email}</span>
                  </div>

                  <div className="usuario-item">
                    <span className="usuario-label">Rol</span>
                    <span className="usuario-value">{usuario.rol}</span>
                  </div>
                </div>

                <button onClick={() => setMostrarCambiarContrasenia(true)}>
                  Cambiar Contraseña <TbLockPassword />
                </button>
              </>
            ) : (
              <p>Usuario no encontrado</p>
            )}
          </div>

          <CambiarContrasenia
            isOpen={mostrarCambiarContrasenia}
            onClose={() => setMostrarCambiarContrasenia(false)}
            desdePerfil={true}
          />
        </div>
      )}
    </>
  );
};

export default PerfilUsuario;
