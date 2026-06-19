import { FaCalendarCheck } from "react-icons/fa";
import "./FechaCompraExistenteModal.css";

const FechaCompraExistenteModal = ({ unidad, onClose }) => {
  if (!unidad) return null;

  return (
    <div className="modal-overlay unidad-child-modal-overlay">
      <div className="modal-card-fecha unidad-child-modal-card">
        <div className="modal-header-fecha">
          <FaCalendarCheck />
          <span>Fecha registrada</span>
        </div>

        <div className="modal-body-fecha">
          <p className="modal-text">
            La unidad <strong>{unidad.identificador}</strong> ya tiene una fecha de compra registrada.
          </p>

          <div className="fecha-display">
            {new Date(unidad.fechaCompra).toLocaleDateString("es-UY")}
          </div>

          <button className="btn-entendido" onClick={onClose}>
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FechaCompraExistenteModal;
