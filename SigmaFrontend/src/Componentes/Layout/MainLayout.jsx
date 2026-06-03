import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser } from "react-icons/fa";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch (e) {
    usuario = null;
  }

  return (
    <div className="app-layout-container">
      <div className="topbar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>

        <nav className="nav">
          <button
            className={`btn-nav equipos ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <VscTools />{" "}
            {usuario?.rol === "Admin"
              ? "Gestión de equipos y usuarios"
              : "Gestión de equipos"}
          </button>
          
          <button 
            className={`btn-nav mapa ${location.pathname === "/mapa" ? "active" : ""}`} 
            onClick={() => navigate("/mapa")}
          >
            <TfiMapAlt /> Ver mapa
          </button>
        </nav>

        <div className="topbar-right">
          <button
            className={`btn-nav usuario ${location.pathname === "/perfil" ? "active" : ""}`}
            onClick={() => navigate("/perfil")}
          >
            <FaRegUser />
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

      <footer className="mobile-footer">
        <button
          className={`mobile-footer-btn ${location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <VscTools />
          <span>Gestion</span>
        </button>
        
        <button 
          className={`mobile-footer-btn ${location.pathname === "/mapa" ? "active" : ""}`} 
          onClick={() => navigate("/mapa")}
        >
          <TfiMapAlt />
          <span>Mapa</span>
        </button>
        
        <button
          className={`mobile-footer-btn ${location.pathname === "/perfil" ? "active" : ""}`}
          onClick={() => navigate("/perfil")}
        >
          <FaRegUser />
          <span>Perfil</span>
        </button>
      </footer>
    </div>
  );
};

export default MainLayout;