import React, { useState } from "react";
import toast from "react-hot-toast";
import "./TrasladarUnidadesModal.css";

const TrasladarUnidadesModal = ({ isOpen, onClose, obraOrigen, obras, onSuccess, rolUsuario }) => {
  const [obraDestinoId, setObraDestinoId] = useState("");
  const [tipoTraslado, setTipoTraslado] = useState("todo");
  const [unidadesSeleccionadas, setUnidadesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !obraOrigen) return null;

  const esAdmin = rolUsuario === "Admin";

  const todasLasUnidades = [
    ...(obraOrigen.maquinas || []).map(u => ({ ...u, tipoClase: "Máquina" })),
    ...(obraOrigen.herramientas || []).map(u => ({ ...u, tipoClase: "Herramienta" }))
  ];

  const handleCheckboxChange = (id) => {
    setUnidadesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (unidadesSeleccionadas.length === todasLasUnidades.length) {
      setUnidadesSeleccionadas([]);
    } else {
      setUnidadesSeleccionadas(todasLasUnidades.map(u => u._id));
    }
  };

  const handleAccionPrincipal = async () => {
    if (!obraDestinoId) {
      toast.error("Seleccione una obra destino");
      return;
    }

    if (tipoTraslado === "especifico" && unidadesSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una unidad");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const unidadesAEnviar = tipoTraslado === "todo" 
        ? todasLasUnidades.map(u => u._id) 
        : unidadesSeleccionadas;

      if (esAdmin) {

        const payloadAdmin = {
          obraOrigenId: obraOrigen._id,
          obraDestinoId,
          unidadesIds: unidadesAEnviar,
        };

        const res = await fetch("http://localhost:5001/unidades/trasladar", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadAdmin),
        });

        const data = await res.json();

        if (res.status === 401) {
          window.dispatchEvent(new Event("token-expirado"));
          throw new Error("Sesión expirada");
        }

        if (!res.ok) throw new Error(data.error || "Error al ejecutar el traslado");
        toast.success("Equipos trasladados exitosamente");

      } else {
        const payloadFuncionario = {
          obraOrigen: obraOrigen._id,
          obraDestino: obraDestinoId,
          unidades: unidadesAEnviar,
        };

        const res = await fetch("http://localhost:5001/solicitudes/traslado", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadFuncionario),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al enviar la solicitud");
        toast.success(data.message || "Solicitud enviada al administrador exitosamente");
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || "Error en la conexión con el servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tieneEquipos = todasLasUnidades.length > 0;

  return (
    <div className="modal-traslado-overlay" onClick={onClose}>
      <div className="modal-traslado-card" onClick={(e) => e.stopPropagation()}>

        <div className="modal-traslado-header">
          <div className="modal-traslado-header-left">
            <div className="modal-traslado-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m17 2 4 4-4 4" />
                <path d="M3 6h18" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 18H3" />
              </svg>
            </div>
            <div>
              <p className="modal-traslado-kicker">Movimiento de unidades</p>
              <h2>
                {!tieneEquipos 
                  ? "Sin unidades para trasladar" 
                  : esAdmin ? "Trasladar Equipos" : "Solicitar Traslado"}
              </h2>
            </div>
          </div>
          <button type="button" className="modal-traslado-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {!tieneEquipos ? (
          <>
            <p className="modal-traslado-description">
              Esta obra no tiene máquinas ni herramientas asignadas actualmente.
            </p>
            <div className="modal-traslado-actions">
              <button type="button" className="modal-traslado-cancel" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-traslado-description">
              {esAdmin 
                ? <>Mueve el inventario desde <strong>{obraOrigen.nombre}</strong> hacia otra obra activa.</>
                : <>Solicita el movimiento del inventario desde <strong>{obraOrigen.nombre}</strong> hacia otra obra activa.</>}
            </p>

            <div className="modal-traslado-tabs-container">
              <label className={`modal-traslado-tab-card ${tipoTraslado === "todo" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="tipoTraslado"
                  value="todo"
                  checked={tipoTraslado === "todo"}
                  onChange={() => setTipoTraslado("todo")}
                />
                <div className="modal-traslado-tab-content">
                  <div className="modal-traslado-tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                  <span className="modal-traslado-tab-text">
                    {esAdmin ? "Mover TODO el inventario" : "Solicitar TODO el inventario"}
                  </span>
                  <div className="modal-traslado-custom-radio"></div>
                </div>
              </label>

              <label className={`modal-traslado-tab-card ${tipoTraslado === "especifico" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="tipoTraslado"
                  value="especifico"
                  checked={tipoTraslado === "especifico"}
                  onChange={() => setTipoTraslado("especifico")}
                />
                <div className="modal-traslado-tab-content">
                  <div className="modal-traslado-tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 16 2 2 4-4" />
                      <path d="m3 9 2 2 4-4" />
                      <path d="M13 6h8" />
                      <path d="M13 12h8" />
                      <path d="M13 18h8" />
                    </svg>
                  </div>
                  <span className="modal-traslado-tab-text">Seleccionar unidades específicas</span>
                  <div className="modal-traslado-custom-radio"></div>
                </div>
              </label>
            </div>

            {tipoTraslado === "especifico" && (
              <div className="modal-traslado-unidades-wrapper">
                <div className="modal-traslado-unidades-header">
                  <label className="modal-traslado-section-label">Selecciona las unidades:</label>
                  <button type="button" className="modal-traslado-btn-link" onClick={handleSelectAll}>
                    {unidadesSeleccionadas.length === todasLasUnidades.length ? "Desmarcar todas" : "Marcar todas"}
                  </button>
                </div>
                
                <div className="modal-traslado-scroll-container">
                  {todasLasUnidades.map((unidad) => (
                    <div key={unidad._id} className="modal-traslado-item-row">
                      <div className="modal-traslado-checkbox-container">
                        <input
                          type="checkbox"
                          id={`chk-${unidad._id}`}
                          checked={unidadesSeleccionadas.includes(unidad._id)}
                          onChange={() => handleCheckboxChange(unidad._id)}
                        />
                        <label htmlFor={`chk-${unidad._id}`} className="modal-traslado-custom-checkbox"></label>
                      </div>
                      <label htmlFor={`chk-${unidad._id}`} className="modal-traslado-item-details">
                        <div className="modal-traslado-item-main">
                          <strong>{unidad.identificador || unidad.modelo}</strong> - {unidad.nombreEquipo}
                        </div>
                        <div className="modal-traslado-item-sub">({unidad.tipoClase})</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-traslado-select-group">
              <label className="modal-traslado-label" htmlFor="obraDestinoId">
                Obra destino
              </label>
              <div className="modal-traslado-select-container">
                <select
                  id="obraDestinoId"
                  className="modal-traslado-select"
                  value={obraDestinoId}
                  onChange={(e) => setObraDestinoId(e.target.value)}
                >
                  <option value="">-- Seleccione una obra --</option>
                  {obras
                    .filter((o) => o._id !== obraOrigen._id && o.estado?.toLowerCase() !== "finalizada")
                    .map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="modal-traslado-actions">
              <button
                type="button"
                className="modal-traslado-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-traslado-confirm"
                onClick={handleAccionPrincipal}
                disabled={loading || !obraDestinoId || (tipoTraslado === "especifico" && unidadesSeleccionadas.length === 0)}
              >
                {loading 
                  ? (esAdmin ? "Trasladando..." : "Enviando solicitud...") 
                  : (esAdmin ? "Trasladar Equipos" : "Solicitar Traslado")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrasladarUnidadesModal;