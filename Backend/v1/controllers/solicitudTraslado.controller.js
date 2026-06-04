import { 
  crearSolicitudTrasladoService, 
  procesarSolicitudTrasladoService,
  confirmarEntregaService,
} from "../services/solicitudTraslado.services.js";

import { 
  obtenerNotificacionesService, 
  marcarNotificacionesLeidasService 
} from "../services/notificacion.services.js";

export const crearSolicitudTraslado = async (req, res) => {
  try {
    const { obraOrigen, obraDestino, unidades } = req.body;
    const funcionarioId = req.usuario.id;

    if (!obraOrigen || !obraDestino || !unidades || unidades.length === 0) {
      return res.status(400).json({ error: "Faltan datos obligatorios para la solicitud" });
    }

    const nuevaSolicitud = await crearSolicitudTrasladoService({
      funcionarioId,
      obraOrigen,
      obraDestino,
      unidades,
    });

    res.status(201).json({ 
      message: "Solicitud de traslado enviada a los administradores correctamente", 
      solicitud: nuevaSolicitud 
    });
  } catch (error) {
    console.error("Error en crearSolicitudTraslado:", error);
    res.status(500).json({ error: "Error interno al crear la solicitud de traslado" });
  }
};

export const procesarSolicitudTraslado = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado } = req.body;
    const adminId = req.usuario.id;

    if (aprobado === undefined) {
      return res.status(400).json({ error: "Debe especificar si la solicitud es aprobada o rechazada" });
    }

    const solicitudProcesada = await procesarSolicitudTrasladoService({
      solicitudId: id,
      aprobado,
      adminId,
    });

    res.status(200).json({ 
      message: `Solicitud procesada como: ${solicitudProcesada.estado}`, 
      solicitud: solicitudProcesada 
    });
  } catch (error) {
    console.error("Error en procesarSolicitudTraslado:", error);
    
    if (error.message === "La solicitud no existe" || error.message === "La solicitud ya fue procesada") {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Error interno al procesar la solicitud" });
  }
};

export const confirmarEntrega = async (req, res) => {
  try {
    const { solicitudId } = req.body;
    const funcionarioId = req.usuario.id;

    if (!solicitudId) {
      return res.status(400).json({ error: "El ID de la solicitud es obligatorio" });
    }

    const registroAccion = await confirmarEntregaService({ solicitudId, funcionarioId });

    res.status(200).json({
      message: "Traslado confirmado y asentado en el historial de acciones del sistema",
      registro: registroAccion
    });
  } catch (error) {
    console.error("Error en confirmarEntrega:", error);
    
    if (error.message === "La solicitud no existe" || error.message === "La solicitud no está autorizada para entrega") {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Error interno al confirmar la entrega" });
  }
};

export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const notificaciones = await obtenerNotificacionesService(usuarioId);
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error("Error en obtenerNotificaciones:", error);
    res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

export const marcarNotificacionesLeidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    await marcarNotificacionesLeidasService(usuarioId);
    res.status(200).json({ message: "Notificaciones marcadas como leídas correctamente" });
  } catch (error) {
    console.error("Error en marcarNotificacionesLeidas:", error);
    res.status(500).json({ error: "Error al actualizar las notificaciones" });
  }
};