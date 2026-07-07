import {
  obtenerNotificacionesService,
  marcarNotificacionesLeidasService,
  registrarPushTokenService,
  eliminarPushTokenService,
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
    res
      .status(200)
      .json({ message: "Notificaciones marcadas como leidas correctamente" });
  } catch (error) {
    console.error("Error en marcarNotificacionesLeidas:", error);
    res.status(500).json({ error: "Error al actualizar las notificaciones" });
  }
};

export const registrarPushToken = async (req, res) => {
  try {
    console.log("Registrando push token");
    console.log("Usuario:", req.usuario?._id);
    console.log("Body:", req.body);

    const usuarioId = req.usuario.id;

    const pushToken = await registrarPushTokenService(
      usuarioId,
      req.body,
    );

    res.status(200).json({
      message: "Token push registrado correctamente",
      pushToken,
    });
  } catch (error) {
    console.error("Error registrando push token:", error);

    res.status(400).json({
      error: error.message || "Error al registrar el token push",
    });
  }
};

export const eliminarPushToken = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    await eliminarPushTokenService(usuarioId, req.body?.token);

    res.status(200).json({
      message: "Token push eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al eliminar el token push",
    });
  }
};
