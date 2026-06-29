import {
  crearSolicitudTrasladoService,
  procesarSolicitudTrasladoService,
  confirmarEntregaService,
} from "../services/solicitudTraslado.services.js";

import {
  obtenerNotificacionesService,
  marcarNotificacionesLeidasService,
} from "../services/notificacion.services.js";

const erroresNegocioTraslado = new Set([
  "Debe seleccionar al menos una unidad",
  "Funcionario invalido",
  "Obra origen invalido",
  "Obra destino invalido",
  "Unidad invalido",
  "Solicitud invalido",
  "Administrador invalido",
  "La obra destino debe ser distinta a la obra origen",
  "El funcionario no existe",
  "La obra origen no existe",
  "La obra destino no existe",
  "La obra destino esta finalizada",
  "No hay administradores disponibles para procesar la solicitud",
  "Hay unidades que no pertenecen a la obra origen o no existen",
  "La solicitud no existe",
  "Solo un administrador puede procesar la solicitud",
  "La solicitud ya fue procesada",
  "La solicitud no esta autorizada para entrega",
  "Solo el funcionario solicitante puede confirmar la entrega",
  "No se pudieron trasladar todas las unidades solicitadas",
]);

const responderErrorTraslado = (res, error, mensajeInterno) => {
  if (error.name === "CastError" || erroresNegocioTraslado.has(error.message)) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: mensajeInterno });
};

export const crearSolicitudTraslado = async (req, res) => {
  try {
    const { obraOrigen, obraDestino, unidades } = req.body;
    const funcionarioId = req.usuario.id;

    if (
      !obraOrigen ||
      !obraDestino ||
      !Array.isArray(unidades) ||
      unidades.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Faltan datos obligatorios para la solicitud" });
    }

    const nuevaSolicitud = await crearSolicitudTrasladoService({
      funcionarioId,
      obraOrigen,
      obraDestino,
      unidades,
    });

    return res.status(201).json({
      message: "Solicitud de traslado enviada a los administradores correctamente",
      solicitud: nuevaSolicitud,
    });
  } catch (error) {
    console.error("Error en crearSolicitudTraslado:", error);
    return responderErrorTraslado(
      res,
      error,
      "Error interno al crear la solicitud de traslado",
    );
  }
};

export const procesarSolicitudTraslado = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado } = req.body;
    const adminId = req.usuario.id;

    if (typeof aprobado !== "boolean") {
      return res.status(400).json({
        error: "Debe especificar si la solicitud es aprobada o rechazada",
      });
    }

    const solicitudProcesada = await procesarSolicitudTrasladoService({
      solicitudId: id,
      aprobado,
      adminId,
    });

    return res.status(200).json({
      message: `Solicitud procesada como: ${solicitudProcesada.estado}`,
      solicitud: solicitudProcesada,
    });
  } catch (error) {
    console.error("Error en procesarSolicitudTraslado:", error);
    return responderErrorTraslado(
      res,
      error,
      "Error interno al procesar la solicitud",
    );
  }
};

export const confirmarEntrega = async (req, res) => {
  try {
    const { solicitudId } = req.body;
    const funcionarioId = req.usuario.id;

    if (!solicitudId) {
      return res
        .status(400)
        .json({ error: "El ID de la solicitud es obligatorio" });
    }

    const registroAccion = await confirmarEntregaService({
      solicitudId,
      funcionarioId,
    });

    return res.status(200).json({
      message: "Traslado confirmado y asentado en el historial de acciones del sistema",
      registro: registroAccion,
    });
  } catch (error) {
    console.error("Error en confirmarEntrega:", error);
    return responderErrorTraslado(
      res,
      error,
      "Error interno al confirmar la entrega",
    );
  }
};

export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const notificaciones = await obtenerNotificacionesService(usuarioId);
    return res.status(200).json(notificaciones);
  } catch (error) {
    console.error("Error en obtenerNotificaciones:", error);
    return res.status(500).json({ error: "Error al obtener las notificaciones" });
  }
};

export const marcarNotificacionesLeidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    await marcarNotificacionesLeidasService(usuarioId);
    return res
      .status(200)
      .json({ message: "Notificaciones marcadas como leidas correctamente" });
  } catch (error) {
    console.error("Error en marcarNotificacionesLeidas:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar las notificaciones" });
  }
};
