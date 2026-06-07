import { FaCalendarCheck } from "react-icons/fa";

const FechaCompraExistenteModal = ({ unidad, onClose }) => {
  if (!unidad) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>
          <FaCalendarCheck style={{ marginRight: 8 }} />
          Fecha registrada
        </h2>

        <p>
          La unidad <strong>{unidad.identificador}</strong> ya tiene una fecha
          de compra registrada.
        </p>

        <div
          style={{
            padding: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          {new Date(unidad.fechaCompra).toLocaleDateString("es-UY")}
        </div>

        <div className="acciones">
          <button className="btn-cancel" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default FechaCompraExistenteModal;