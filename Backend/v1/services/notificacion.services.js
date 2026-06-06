import Notificacion from "../models/Notificacion.js";

export const obtenerNotificacionesService = async (usuarioId) => {
  const notificaciones = await Notificacion.find({
    usuario: usuarioId,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({
      path: "solicitudId",
      populate: [
        {
          path: "funcionario",
        },
        {
          path: "obraOrigen",
        },
        {
          path: "obraDestino",
        },
        {
          path: "unidades",
          populate: {
            path: "equipo",
          },
        },
      ],
    });

  return notificaciones;
};

export const marcarNotificacionesLeidasService = async (
  usuarioId
) => {
  const resultado = await Notificacion.updateMany(
    {
      usuario: usuarioId,
      leida: false,
    },
    {
      $set: { leida: true },
    }
  );

  return resultado;
};