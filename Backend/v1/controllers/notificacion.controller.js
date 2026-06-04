import { 
  obtenerNotificacionesService, 
  marcarNotificacionesLeidasService
} from "../services/notificacion.services.js";

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