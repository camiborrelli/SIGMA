import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser, FaBell } from "react-icons/fa";
import "./MainLayout.css";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
      const res = await fetch(`http://localhost:5001/solicitudes/traslado/${solicitudId}/procesar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aprobado }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const confirmarEntrega = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/solicitudes/traslado/confirmar-entrega", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ solicitudId }),
      });
      if (!res.ok) throw new Error("Error al confirmar entrega");
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const cargarNotificaciones = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5001/notificaciones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotificaciones(await res.json());
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const marcarComoLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5001/notificaciones/leidas", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
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

  useEffect(() => {
    cargarNotificaciones();
    const handleClickOutside = (event) => {
      if (
        headerRef.current && !headerRef.current.contains(event.target) &&
        footerRef.current && !footerRef.current.contains(event.target)
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
        <button className="close-dropdown-btn" onClick={() => setShowDropdown(false)}>&times;</button>
      </div>
      <div className="notification-list">
        {notificaciones.length === 0 ? <p className="no-notifications">No hay notificaciones.</p> : notificaciones.map((n) => (
          <div key={n._id} className={`notification-item ${!n.leida ? "unread" : ""}`}>
            <p>{n.mensaje}</p>
            <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
            {usuario?.rol === "Admin" && n.tipo === "solicitud" && (
              <div className="notification-actions">
                <button onClick={() => procesarSolicitud(n.solicitudId, true)}>Aprobar</button>
                <button onClick={() => procesarSolicitud(n.solicitudId, false)}>Rechazar</button>
              </div>
            )}
            {usuario?.rol !== "Admin" && n.tipo === "solicitud_aprobada" && (
              <div className="notification-actions">
                <button onClick={() => confirmarEntrega(n.solicitudId)}>Confirmar entrega</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app-layout-container">
      <div className="topbar">
        <div className="logo-container"><img src={logo} alt="Logo" className="logo-img" /></div>
        <nav className="nav">
          <button className={`btn-nav ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
            <VscTools /> {usuario?.rol === "Admin" ? "Gestión de equipos y usuarios" : "Gestión de equipos"}
          </button>
          <button className={`btn-nav ${location.pathname === "/mapa" ? "active" : ""}`} onClick={() => navigate("/mapa")}>
            <TfiMapAlt /> Ver mapa
          </button>
        </nav>
        <div className="topbar-right" ref={headerRef}>
          <div className="notification-wrapper desktop-only">
            <button className="btn-nav bell-btn" onClick={handleToggleDropdown}>
              <div className="icon-badge-wrapper">
                <FaBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
            </button>
            {showDropdown && renderDropdown()}
          </div>
          <button className={`btn-nav ${location.pathname === "/perfil" ? "active" : ""}`} onClick={() => navigate("/perfil")}>
            <FaRegUser /> {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario"}
          </button>
          <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </div>
      <main className="main-content-wrapper"><Outlet /></main>
      <footer className="mobile-footer" ref={footerRef}>
        <button className={`mobile-footer-btn ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => navigate("/dashboard")}><VscTools /> <span>Gestión</span></button>
        <button className={`mobile-footer-btn ${location.pathname === "/mapa" ? "active" : ""}`} onClick={() => navigate("/mapa")}><TfiMapAlt /> <span>Mapa</span></button>
        <div className="notification-wrapper mobile-only">
          <button className="mobile-footer-btn" onClick={handleToggleDropdown}>
            <div className="icon-badge-wrapper">
              <FaBell /> {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            <span>Notif.</span>
          </button>
          {showDropdown && renderDropdown()}
        </div>
        <button className={`mobile-footer-btn ${location.pathname === "/perfil" ? "active" : ""}`} onClick={() => navigate("/perfil")}><FaRegUser /> <span>Perfil</span></button>
      </footer>
    </div>
  );
};

export default MainLayout;