import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegistro.css";
import toast from "react-hot-toast";
import CambiarContrasenia from "./CambiarContrasenia";
import { API_URL } from "../../../api";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const [erros, setErrors] = useState({});
  const [showmodal, setShowModal] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);

  const [rolSeleccionado, setRolSeleccionado] = useState("Funcionario");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [showCambiarContrasenia, setShowCambiarContrasenia] = useState(false);

  const toggle = () => {
    setMensaje("");
    navigate("/register");
  };

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("usuario");

  useEffect(() => {
    if (token && user) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        //validar expiración
        if (payload.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUsuario(JSON.parse(user));
        } else {
          localStorage.clear();
        }
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await res.json();

      if (!res.ok) {
        setMensaje(result.error || "Error en login");
        return;
      }

      localStorage.setItem("token", result.token);

      if (result.usuario) {
        localStorage.setItem("usuario", JSON.stringify(result.usuario));
        setUsuario(result.usuario);
      }

      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (err) {
      setMensaje("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioId");
    setIsAuthenticated(false);
    setUsuario(null);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Acceso al sistema</h2>
        <p className="subtitle">Inicia sesión para continuar</p>

        <div className="roles">
          <button
            className={`role-btn ${
              rolSeleccionado === "Funcionario" ? "active" : ""
            }`}
            onClick={() => setRolSeleccionado("Funcionario")}
            type="button"
          >
            Funcionario
          </button>

          <button
            className={`role-btn ${
              rolSeleccionado === "Admin" ? "active" : ""
            }`}
            onClick={() => setRolSeleccionado("Admin")}
            type="button"
          >
            Administrador
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />

          {mensaje && <p className="error">{mensaje}</p>}

          <button
            type="button"
            className=" btn-restore"
            onClick={() => setShowCambiarContrasenia(true)}
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <button
            className={`btn btn-register ${loading ? "is-loading" : ""}`}
            disabled={loading}
          >
            <span className="btn-fill" />
            <span className="btn-label">
              {loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
            </span>
          </button>
        </form>

        <p className="link">
          <span className="texto">¿No tienes cuenta?</span>{" "}
          <span className="accion" onClick={toggle}>
            Registrarse
          </span>
        </p>
      </div>

      <CambiarContrasenia
        isOpen={showCambiarContrasenia}
        onClose={() => setShowCambiarContrasenia(false)}
        desdePerfil={false}
      />
    </div>
  );
};

export default Login;
