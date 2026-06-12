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
  const [errors, setErrors] = useState({});

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

    toast.success("Usuario registrado correctamente");
    setIsLogin(true);
    navigate("/dashboard");

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
        <h2>Registro de usuario</h2>
        {/* <p className="subtitle">Crea tu cuenta</p> */}

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
