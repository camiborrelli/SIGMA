import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [rolSeleccionado, setRolSeleccionado] = useState("Funcionario");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [usuario, setUsuario] = useState(null);

  const toggle = () => {
    setIsLogin(!isLogin);
    setMensaje("");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");

    if (token && user) {
      setIsAuthenticated(true);
      setUsuario(JSON.parse(user));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");

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
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (registerData.password !== registerData.confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    const res = await fetch("http://localhost:5001/usuarios/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        email: registerData.email,
        password: registerData.password,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setMensaje(result.error || "Error en registro");
      return;
    }

    setMensaje("Usuario registrado correctamente");
    setIsLogin(true);

    setRegisterData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
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

          <p><strong>Email:</strong> {usuario?.email}</p>
          <p><strong>Rol:</strong> {usuario?.rol}</p>

          <button className="btn" onClick={logout}>
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {isLogin ? (
        <div className="card">
          <h2>Acceso al Sistema</h2>
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

          {mensaje && <p className="error">{mensaje}</p>}

          <form onSubmit={handleLogin}>
            <label>Correo electrónico</label>
            <input
              type="email"
              required
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />

            <label>Contraseña</label>
            <input
              type="password"
              required
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />

            <button className="btn">INICIAR SESIÓN</button>
          </form>

          <p className="link">
            <span className="texto">¿No tienes cuenta?</span>{" "}
            <span className="accion" onClick={toggle}>Registrarse</span>
          </p>
        </div>
      ) : (
        <div className="card">
          <h2>Registro de Usuario</h2>
          <p className="subtitle">Crea tu cuenta</p>

          {mensaje && <p className="error">{mensaje}</p>}

          <form onSubmit={handleRegister}>
            <label>Nombre</label>
            <input
              type="text"
              required
              value={registerData.nombre}
              onChange={(e) =>
                setRegisterData({ ...registerData, nombre: e.target.value })
              }
            />

            <label>Apellido</label>
            <input
              type="text"
              required
              value={registerData.apellido}
              onChange={(e) =>
                setRegisterData({ ...registerData, apellido: e.target.value })
              }
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              required
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />

            <label>Contraseña</label>
            <input
              type="password"
              required
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />

            <label>Confirmar contraseña</label>
            <input
              type="password"
              required
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <button className="btn">CREAR CUENTA</button>
          </form>

          <p className="link">
            <span className="texto">¿Ya tienes cuenta?</span>{" "}
              <span className="accion" onClick={toggle}>
              Iniciar sesión
              </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;