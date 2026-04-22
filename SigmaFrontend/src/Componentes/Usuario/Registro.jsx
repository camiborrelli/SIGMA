import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginRegistro.css";

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

  const toggle = () => {
    navigate("/");
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

  return (
    <div className="container">
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
    </div>
  );
};

export default Registro;
