import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";
import "./ModalAccionesUsuarios.css";

const ITEMS_POR_PAGINA = 10;

const ModalAcciones = ({ isOpen, onClose }) => {
  const [acciones, setAcciones] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);

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

  useEffect(() => {
    setPaginaActual(1);
  }, [acciones.length]);

  if (!isOpen) return null;

  const totalPaginas = Math.ceil(acciones.length / ITEMS_POR_PAGINA);
  const accionesVisibles = acciones.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );

  const irPaginaAnterior = () => {
    setPaginaActual((pagina) => Math.max(1, pagina - 1));
  };

  const irPaginaSiguiente = () => {
    setPaginaActual((pagina) => Math.min(totalPaginas, pagina + 1));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Registro de acciones</h3>

        {acciones.length === 0 ? (
          <p>No hay acciones registradas.</p>
        ) : (
          <>
            <div className="tabla-wrapper modal-acciones-tabla">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {accionesVisibles.map((accion) => (
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
            </div>

            {totalPaginas > 1 && (
              <div className="paginacion-modal-acciones">
                <button
                  type="button"
                  onClick={irPaginaAnterior}
                  disabled={paginaActual === 1}
                >
                  ←
                </button>

                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>

                <button
                  type="button"
                  onClick={irPaginaSiguiente}
                  disabled={paginaActual === totalPaginas}
                >
                  →
                </button>
              </div>
            )}
          </>
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
