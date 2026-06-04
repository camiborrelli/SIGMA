import SolicitudTraslado from "../models/SolicitudTraslado.js";
import Notificacion from "../models/Notificacion.js";
import Unidad from "../models/unidad.model.js";
import Usuario from "../models/usuario.model.js";
import AccionUsuario from "../models/accionUsuario.model.js";

export const crearSolicitudTrasladoService = async ({ funcionarioId, obraOrigen, obraDestino, unidades }) => {
  const nuevaSolicitud = new SolicitudTraslado({
    funcionario: funcionarioId,
    obraOrigen,
    obraDestino,
    unidades,
  });
  
  await nuevaSolicitud.save();

  const admins = await Usuario.find({ rol: "Admin", estado: "Activo" });
  
  const promesasNotificaciones = admins.map((admin) => {
    return new Notificacion({
    usuario: admin._id,
    mensaje: "Un funcionario ha solicitado un traslado de equipos hacia una nueva obra.",
    tipo: "solicitud",
    solicitudId: nuevaSolicitud._id,
    }).save();
  });
  
  await Promise.all(promesasNotificaciones);

  return nuevaSolicitud;
};

export const procesarSolicitudTrasladoService = async ({ solicitudId, aprobado, adminId }) => {
  const solicitud = await SolicitudTraslado.findById(solicitudId).populate("funcionario obraDestino");
  
  if (!solicitud) {
    throw new Error("La solicitud no existe");
  }
  if (solicitud.estado !== "Pendiente") {
    throw new Error("La solicitud ya fue procesada");
  }

  solicitud.procesadoPor = adminId;
  solicitud.fechaProcesado = new Date();

  if (aprobado) {
    solicitud.estado = "Aprobada";

    await new Notificacion({
      usuario: solicitud.funcionario._id,
      mensaje: `Tu solicitud de traslado a la obra "${solicitud.obraDestino.nombre}" fue autorizada. Por favor, confirma cuando los equipos hayan sido entregados correctamente.`,
      tipo: "solicitud_aprobada",
      solicitudId: solicitud._id,
    }).save();
    
  } else {
    solicitud.estado = "Rechazada";

    await new Notificacion({
      usuario: solicitud.funcionario._id,
      mensaje: `Tu solicitud de traslado a la obra "${solicitud.obraDestino.nombre}" ha sido RECHAZADA.`,
      tipo: "respuesta",
      solicitudId: solicitud._id,
    }).save();
  }

  await solicitud.save();
  return solicitud;
};

export const confirmarEntregaService = async ({ solicitudId, funcionarioId }) => {
  const solicitud = await SolicitudTraslado.findById(solicitudId).populate("obraDestino");

  if (!solicitud) throw new Error("La solicitud no existe");
  if (solicitud.estado !== "Aprobada") throw new Error("La solicitud no está autorizada para entrega");

  solicitud.estado = "Completada";
  await solicitud.save();

  await Unidad.updateMany(
    { _id: { $in: solicitud.unidades } },
    { $set: { ubicacion: solicitud.obraDestino._id, estado: "Asignada" } }
  );

  const cantidadEquipos = solicitud.unidades.length;
  const nombreObra = solicitud.obraDestino.nombre;

  const nuevaAccion = new AccionUsuario({
    usuario: funcionarioId, 
    accion: `Confirmación de traslado de ${cantidadEquipos} equipo/s hacia la obra "${nombreObra}"`,
    recursoAfectado: `Colección: Unidad | SolicitudTraslado ID: ${solicitud._id}`
  });
  
  await nuevaAccion.save();
  
  await new Notificacion({
    usuario: solicitud.funcionario._id,
    mensaje: `Confirmaste la entrega de equipos en "${nombreObra}". El traslado fue completado.`,
    tipo: "respuesta",
    solicitudId: solicitud._id,
  }).save();

  return nuevaAccion;
};