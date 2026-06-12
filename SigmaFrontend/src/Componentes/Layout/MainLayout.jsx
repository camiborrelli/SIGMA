import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser, FaBell } from "react-icons/fa";
import "./MainLayout.css";
import ModalDetalleNotificacion from "./ModalDetalleNotificacion";
import API_URL from ".../api";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificacionSeleccionada, setNotificacionSeleccionada] =
    useState(null);
  const [verModalNotificacion, setVerModalNotificacion] = useState(false);

  const headerRef = useRef(null);
  const footerRef = useRef(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const procesarSolicitud = async (solicitudId, aprobado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/solicitudes/traslado/${solicitudId}/procesar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ aprobado }),
        },
      );

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }

      if (!res.ok) throw new Error((await res.json()).error);

      toast.success(
        `Solicitud ${aprobado ? "aprobada" : "rechazada"} con éxito`,
      );

      setVerModalNotificacion(false);
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error al procesar la solicitud");
    }
  };

  const confirmarEntrega = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/solicitudes/traslado/confirmar-entrega`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ solicitudId }),
        },
      );
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      
      if (!res.ok) throw new Error("Error al confirmar entrega");

      toast.success("Entrega confirmada con éxito");

      setVerModalNotificacion(false);
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error al confirmar la entrega");
    }
  };

  const cargarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      if (res.ok) setNotificaciones(await res.json());
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const marcarComoLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/notificaciones/leidas`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    const newState = !showDropdown;
    setShowDropdown(newState);
    if (newState && notificaciones.some((n) => !n.leida)) {
      marcarComoLeidas();
    }
  };

  const handleNotificacionClick = (n) => {
    const esSolicitudAdmin = usuario?.rol === "Admin" && n.tipo === "solicitud";
    const esSolicitudUsuario =
      usuario?.rol !== "Admin" && n.tipo === "solicitud_aprobada";

    if ((esSolicitudAdmin || esSolicitudUsuario) && n.solicitudId) {
      setNotificacionSeleccionada(n);
      setVerModalNotificacion(true);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const handleClickOutside = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target) &&
        footerRef.current &&
        !footerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  const renderDropdown = () => (
    <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-header">
        <h4>Notificaciones</h4>
        <button
          className="close-dropdown-btn"
          onClick={() => setShowDropdown(false)}
        >
          &times;
        </button>
      </div>
      <div className="notification-list">
        {notificaciones.length === 0 ? (
          <p className="no-notifications">No hay notificaciones.</p>
        ) : (
          notificaciones.map((n) => {
            const requiereAccion =
              (usuario?.rol === "Admin" && n.tipo === "solicitud") ||
              (usuario?.rol !== "Admin" && n.tipo === "solicitud_aprobada");

            return (
              <div
                key={n._id}
                className={`notification-item ${!n.leida ? "unread" : ""} ${
                  requiereAccion ? "clickable" : ""
                }`}
                onClick={() => handleNotificacionClick(n)}
              >
                <p>{n.mensaje}</p>
                <span className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="app-layout-container">
      <div className="topbar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <nav className="nav">
          <button
            className={`btn-nav ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => navigate("/dashboard")}
          >
            <VscTools />{" "}
            {usuario?.rol === "Admin"
              ? "Gestión de equipos y usuarios"
              : "Gestión de equipos"}
          </button>
          <button
            className={`btn-nav ${
              location.pathname === "/mapa" ? "active" : ""
            }`}
            onClick={() => navigate("/mapa")}
          >
            <TfiMapAlt /> Ver mapa
          </button>
        </nav>
        <div className="topbar-right" ref={headerRef}>
          <div className="notification-wrapper desktop-only">
            <button className="btn-nav bell-btn" onClick={handleToggleDropdown}>
              <div className="icon-badge-wrapper">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>
            </button>
            {showDropdown && renderDropdown()}
          </div>
          <button
            className={`btn-nav ${
              location.pathname === "/perfil" ? "active" : ""
            }`}
            onClick={() => navigate("/perfil")}
          >
            <FaRegUser />{" "}
            {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario"}
          </button>
          <button className="btn-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <main className="main-content-wrapper">
        <Outlet />
      </main>

      <footer className="mobile-footer" ref={footerRef}>
        <button
          className={`mobile-footer-btn ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <VscTools /> <span>Gestión</span>
        </button>
        <button
          className={`mobile-footer-btn ${
            location.pathname === "/mapa" ? "active" : ""
          }`}
          onClick={() => navigate("/mapa")}
        >
          <TfiMapAlt /> <span>Mapa</span>
        </button>
        <div className="notification-wrapper mobile-only">
          <button className="mobile-footer-btn" onClick={handleToggleDropdown}>
            <div className="icon-badge-wrapper">
              <FaBell />{" "}
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <span>Notif.</span>
          </button>
          {showDropdown && renderDropdown()}
        </div>
        <button
          className={`mobile-footer-btn ${
            location.pathname === "/perfil" ? "active" : ""
          }`}
          onClick={() => navigate("/perfil")}
        >
          <FaRegUser /> <span>Perfil</span>
        </button>
      </footer>

      {verModalNotificacion && notificacionSeleccionada && (
        <ModalDetalleNotificacion
          isOpen={verModalNotificacion}
          onClose={() => setVerModalNotificacion(false)}
          notificacion={notificacionSeleccionada}
          solicitud={notificacionSeleccionada.solicitudId}
          onAprobar={() =>
            procesarSolicitud(notificacionSeleccionada.solicitudId._id, true)
          }
          onRechazar={() =>
            procesarSolicitud(notificacionSeleccionada.solicitudId._id, false)
          }
          onConfirmarEntrega={() =>
            confirmarEntrega(notificacionSeleccionada.solicitudId._id)
          }
          rolUsuario={usuario?.rol}
        />
      )}
    </div>
  );
};

export default MainLayout;
