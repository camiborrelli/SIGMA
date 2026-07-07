import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";
import "./ModalAccionesUsuarios.css";

const ModalAcciones = ({ isOpen, onClose }) => {
  const [acciones, setAcciones] = useState([]);

  useEffect(() => {
    // if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const getAccionesUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/usuarios/accionesUsuario`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
          throw new Error("Sesión expirada");
        }

        if (!res.ok) throw new Error("Error al obtener acciones");

        const data = await res.json();
        setAcciones(data);
      } catch (err) {
        console.error(err);
        toast.error("Error al obtener acciones de usuarios");
      }
    };

    getAccionesUsuarios();
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Registro de acciones</h3>

        {acciones.length === 0 ? (
          <p>No hay acciones registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {acciones.map((accion) => (
                <tr key={accion._id}>
                  <td>
                    {typeof accion.usuario === "object"
                      ? `${accion.usuario.nombre} ${accion.usuario.apellido}`
                      : accion.usuario}
                  </td>
                  <td>{accion.accion}</td>
                  <td>{new Date(accion.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAcciones;
