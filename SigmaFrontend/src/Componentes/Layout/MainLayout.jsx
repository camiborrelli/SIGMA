import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import {
  FaBell,
  FaExclamationTriangle,
  FaRegUser,
  FaSignOutAlt,
  FaTools,
} from "react-icons/fa";
import "./MainLayout.css";
import ModalDetalleNotificacion from "./ModalDetalleNotificacion";
import { API_URL } from "../../../api";

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

  const obtenerMensajeError = async (res, fallback) => {
    const data = await res.json().catch(() => ({}));
    return data.error || data.message || fallback;
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

      if (!res.ok) {
        throw new Error(
          await obtenerMensajeError(res, "Error al procesar la solicitud"),
        );
      }

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

      if (!res.ok) {
        throw new Error(
          await obtenerMensajeError(res, "Error al confirmar entrega"),
        );
      }

      toast.success("Entrega confirmada con éxito");

      setVerModalNotificacion(false);
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error al confirmar la entrega");
    }
  };

  const cargarNotificaciones = useCallback(async () => {
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
  }, []);

  const revisarGarantiasPorVencer = useCallback(async () => {
    if (usuario?.rol !== "Admin") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/unidades/garantias/revisar?dias=30`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("SesiÃ³n expirada");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al revisar garantias por vencer");
      }
    } catch (error) {
      console.error("Error al revisar garantias por vencer:", error);
    }
  }, [usuario?.rol]);

  const marcarComoLeidas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/notificaciones/leidas`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.dispatchEvent(new Event("token-expirado"));
        throw new Error("Sesión expirada");
      }
      if (!res.ok) return;
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

  const handleNotificacionClick = (n) => {
    if (n.tipo === "garantia_por_vencer" && n.unidadId) {
      const unidadId =
        typeof n.unidadId === "object" ? n.unidadId._id : n.unidadId;
      navigate(`/garantia/${unidadId}`);
      setShowDropdown(false);
      return;
    }

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
    const inicializarNotificaciones = async () => {
      await revisarGarantiasPorVencer();
      await cargarNotificaciones();
    };

    inicializarNotificaciones();

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

    const intervaloNotificaciones = setInterval(cargarNotificaciones, 60000);

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(intervaloNotificaciones);
    };
  }, [cargarNotificaciones, revisarGarantiasPorVencer]);

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
              (usuario?.rol !== "Admin" && n.tipo === "solicitud_aprobada") ||
              n.tipo === "garantia_por_vencer";

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
            <span>
              {usuario?.rol === "Admin" ? "Gestión" : "Gestión de equipos"}
            </span>
          </button>
          {usuario?.rol === "Admin" && (
            <button
              className={`btn-nav ${
                location.pathname === "/gestion-mantenimiento" ? "active" : ""
              }`}
              onClick={() => navigate("/gestion-mantenimiento")}
            >
              <FaTools /> <span>Gestion de mantenimiento</span>
            </button>
          )}
          <button
            className={`btn-nav ${
              location.pathname === "/garantias-vencer" ? "active" : ""
            }`}
            onClick={() => navigate("/garantias-vencer")}
          >
            <FaExclamationTriangle /> <span>Garantias</span>
          </button>
          <button
            className={`btn-nav ${
              location.pathname === "/mapa" ? "active" : ""
            }`}
            onClick={() => navigate("/mapa")}
          >
            <TfiMapAlt /> <span>Ver mapa</span>
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
            className={`btn-nav btn-perfil-topbar ${
              location.pathname === "/perfil" ? "active" : ""
            }`}
            onClick={() => navigate("/perfil")}
          >
            <FaRegUser />{" "}
            <span className="user-name-text">
              {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Usuario"}
            </span>
          </button>
          <button className="btn-logout" onClick={logout} title="Cerrar sesión">
            <FaSignOutAlt className="logout-icon" />
            <span className="logout-text">Cerrar sesión</span>
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
        {usuario?.rol === "Admin" && (
          <button
            className={`mobile-footer-btn ${
              location.pathname === "/gestion-mantenimiento" ? "active" : ""
            }`}
            onClick={() => navigate("/gestion-mantenimiento")}
          >
            <FaTools /> <span>Manten.</span>
          </button>
        )}
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
