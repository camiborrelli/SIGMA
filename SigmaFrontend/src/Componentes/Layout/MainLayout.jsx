import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/LogoSinFondo.png";
import { TfiMapAlt } from "react-icons/tfi";
import { VscTools } from "react-icons/vsc";
import { FaRegUser } from "react-icons/fa";

const MainLayout = () => {
  const navigate = useNavigate();

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
          <button className="btn-nav" onClick={() => navigate("/dashboard")}>
            <VscTools /> Gestión de equipos
          </button>
          <button className="btn-nav" onClick={() => navigate("/mapa")}>
            <TfiMapAlt /> Ver mapa
          </button>
        </nav>

        <div className="topbar-right">
          <button className="btn-nav usuario" onClick={() => navigate("/perfil")}>
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
        <button className="mobile-footer-btn" onClick={() => navigate("/dashboard")}>
          <VscTools />
          <span>Gestión</span>
        </button>
        <button className="mobile-footer-btn" onClick={() => navigate("/mapa")}>
          <TfiMapAlt />
          <span>Mapa</span>
        </button>
        <button className="mobile-footer-btn" onClick={() => navigate("/perfil")}>
          <FaRegUser />
          <span>Perfil</span>
        </button>
      </footer>
    </div>
  );
};

export default MainLayout;