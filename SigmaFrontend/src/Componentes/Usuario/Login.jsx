import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegistro.css";

const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const [erros, setErrors] = useState({});

  const [rolSeleccionado, setRolSeleccionado] = useState("Funcionario");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [usuario, setUsuario] = useState(null);

  const toggle = () => {
    setMensaje("");
    navigate("/register");
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");

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

    const res = await fetch("http://localhost:5001/usuarios/login", {
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
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setIsAuthenticated(false);
    setUsuario(null);
  };

  // DASHBOARD
  if (isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h2>Bienvenido {usuario?.nombre}</h2>
          <p className="subtitle">Sistema SIGMA</p>

          <p>
            <strong>Email:</strong> {usuario?.email}
          </p>
          <p>
            <strong>Rol:</strong> {usuario?.rol}
          </p>

          <button className="btn" onClick={logout}>
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Acceso al sistema</h2>
        <p className="subtitle">Inicia sesión para continuar</p>

        <div className="roles">
          <button
            className={`role-btn ${rolSeleccionado === "Funcionario" ? "active" : ""}`}
            onClick={() => setRolSeleccionado("Funcionario")}
            type="button"
          >
            Funcionario
          </button>

          <button
            className={`role-btn ${rolSeleccionado === "Admin" ? "active" : ""}`}
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

          <button className="btn btn-register">INICIAR SESIÓN</button>
        </form>

        <p className="link">
          <span className="texto">¿No tienes cuenta?</span>{" "}
          <span className="accion" onClick={toggle}>
            Registrarse
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
