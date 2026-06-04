import Notificacion from "../models/Notificacion.js";

export const obtenerNotificacionesService = async (usuarioId) => {
  const notificaciones = await Notificacion.find({ usuario: usuarioId })
    .sort({ createdAt: -1 })
    .limit(20);
    
  return notificaciones;
};

export const marcarNotificacionesLeidasService = async (usuarioId) => {
  const resultado = await Notificacion.updateMany(
    { usuario: usuarioId, leido: false },
    { $set: { leido: true } }
  );
  
  return resultado;
};