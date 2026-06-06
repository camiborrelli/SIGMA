import React from "react";
import {
  FaTruck,
  FaRegCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "./ModalDetalleNotificacion.css";

const ModalDetalleNotificacion = ({
  isOpen,
  onClose,
  solicitud,
  onAprobar,
  onRechazar,
  onConfirmarEntrega,
  rolUsuario,
}) => {
  if (!isOpen || !solicitud) return null;

  const esAdmin = rolUsuario === "Admin";

  return (
    <div className="modal-overlay-notif" onClick={onClose}>
      <div
        className="modal-content-notif modal-traslado"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-notif">
          <div className="header-icon">
            <FaTruck />
          </div>

          <div className="header-info">
            <h2>Solicitud de Traslado</h2>
            <p>
              Revisa los detalles de la solicitud antes de tomar una decisión.
            </p>
          </div>

          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body-notif">
          <div className="estado-col">
            <small>Estado</small>
            <span className={`estado-badge ${solicitud.estado?.toLowerCase()}`}>
              {solicitud.estado}
            </span>
          </div>

          <div className="separador-vertical" />

          <div className="fecha-col">
            <small>Fecha de registro</small>
            <span>{new Date(solicitud.createdAt).toLocaleString()}</span>
          </div>

          <div className="separador-vertical" />

          <div className="solicitante-card">
            <div className="avatar-circle">
              {solicitud.funcionario?.nombre?.charAt(0)}
              {solicitud.funcionario?.apellido?.charAt(0)}
            </div>
            <div>
              <small>Solicitado por</small>
              <h4>
                {solicitud.funcionario?.nombre}{" "}
                {solicitud.funcionario?.apellido}
              </h4>
              <span className="rol-chip">Funcionario de Obra</span>
            </div>
          </div>
        </div>

        <div className="obras-grid">
          <div className="obra-card origen">
            <small>Obra origen</small>

            <h4 className="obra-origen">{solicitud.obraOrigen?.nombre}</h4>
          </div>

          <div className="flecha-traslado">→</div>

          <div className="obra-card destino">
            <small>Obra destino</small>

            <h4 className="obra-destino">{solicitud.obraDestino?.nombre}</h4>
          </div>
        </div>

        <div className="equipos-section">
          <h3>Equipos a trasladar ({solicitud.unidades?.length || 0})</h3>

          <table className="equipos-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {solicitud.unidades?.map((unidad) => (
                <tr key={unidad._id}>
                  <td>{unidad.identificador}</td>
                  <td>{unidad.equipo.nombre}</td>
                  <td>{unidad.equipo.tipo}</td>

                  <td>
                    <span className="estado-chip">{unidad.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box">
          <FaInfoCircle />

          <span>
            {esAdmin
              ? "Al aprobar esta solicitud, el funcionario deberá confirmar posteriormente la llegada de los equipos a la obra destino."
              : "Confirma únicamente cuando los equipos hayan llegado correctamente a la obra destino."}
          </span>
        </div>

        <div className="modal-footer-notif">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>

          <div className="acciones">
            {esAdmin ? (
              <>
                <div className="btn-group">
                  <button className="btn-rechazar" onClick={onRechazar}>
                    <FaTimes />
                    Rechazar solicitud
                  </button>

                  <button className="btn-aprobar" onClick={onAprobar}>
                    <FaCheck />
                    Aprobar traslado
                  </button>
                </div>
              </>
            ) : (
              <button className="btn-aprobar" onClick={onConfirmarEntrega}>
                <FaCheck />
                Confirmar entrega
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleNotificacion;
