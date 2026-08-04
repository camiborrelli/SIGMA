import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegistro.css";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";

const Registro = ({ setIsLogin }) => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = () => {
    navigate("/");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/register`, {
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
        toast.error(result.error || "Error en registro");
        return;
      }

      toast.success("Usuario registrado correctamente. Iniciando sesión...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const loginRes = await fetch(`${API_URL}/usuarios/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
          }),
        });

        const loginResult = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("token", loginResult.token);

          if (loginResult.usuario) {
            localStorage.setItem(
              "usuario",
              JSON.stringify(loginResult.usuario),
            );
          }

          navigate("/dashboard");
        } else {
          setIsLogin?.(true);
          navigate("/");
        }
      } catch (err) {
        console.error("Error en auto-login:", err);
        setIsLogin?.(true);
        navigate("/");
      }

      setRegisterData({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Registro de usuario</h2>

        <form onSubmit={handleRegister}>
          <label>Nombre</label>
          <input
            type="text"
            value={registerData.nombre}
            onChange={(e) =>
              setRegisterData({ ...registerData, nombre: e.target.value })
            }
          />

          <label>Apellido</label>
          <input
            type="text"
            value={registerData.apellido}
            onChange={(e) =>
              setRegisterData({ ...registerData, apellido: e.target.value })
            }
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({ ...registerData, email: e.target.value })
            }
          />

          <label>Contraseña</label>
          <input
            type="password"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({ ...registerData, password: e.target.value })
            }
          />

          <label>Confirmar contraseña</label>
          <input
            type="password"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword: e.target.value,
              })
            }
          />
          {mensaje && <p className="error">{mensaje}</p>}
          <button
            className={`btn btn-register ${loading ? "is-loading" : ""}`}
            disabled={loading}
          >
            <span className="btn-fill" />
            <span className="btn-label">
              {loading ? "Creando usuario..." : "CREAR CUENTA"}
            </span>
          </button>
        </form>

        <p className="link">
          <span className="texto">¿Ya tienes cuenta?</span>{" "}
          <span className="accion" onClick={toggle}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default Registro;
