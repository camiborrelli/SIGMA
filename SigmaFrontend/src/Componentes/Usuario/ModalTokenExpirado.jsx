import React from "react";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

const ModalTokenExpirado = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleIrAlLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    onClose();
    navigate("/login");
  };

  return (
    <div className="expirado-modal-overlay">
      <div className="expirado-modal-content">

        <div className="expirado-modal-icono-container">
          <FaExclamationTriangle size={24} />
        </div>

        <h2 className="expirado-modal-titulo">Tu sesión ha expirado</h2>
        
        <p className="expirado-modal-texto">
          Por razones de seguridad, debes volver a iniciar sesión para continuar operando en la plataforma.
        </p>

        <button onClick={handleIrAlLogin} className="expirado-modal-btn">
          Salir
        </button>
      </div>
    </div>
  );
};

export default ModalTokenExpirado;