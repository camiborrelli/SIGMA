import SolicitudTraslado from "../models/SolicitudTraslado.js";
import Notificacion from "../models/Notificacion.js";
import Unidad from "../models/unidad.model.js";
import Usuario from "../models/usuario.model.js";
import AccionUsuario from "../models/accionUsuario.model.js";
import { enviarCorreo } from "../services/email.service.js";


export const crearSolicitudTrasladoService = async ({ funcionarioId, obraOrigen, obraDestino, unidades }) => {
  const funcionario = await Usuario.findById(funcionarioId);
  
  const nuevaSolicitud = new SolicitudTraslado({
    funcionario: funcionarioId,
    obraOrigen,
    obraDestino,
    unidades,
  });
  
  await nuevaSolicitud.save();

  const admins = await Usuario.find({ rol: "Admin"});
  
  const promesasNotificaciones = admins.map(async (admin) => {

    const mensaje = `El funcionario ${funcionario.nombre} ${funcionario.apellido} ha solicitado un traslado de equipos hacia una nueva obra.`;

    await new Notificacion({
      usuario: admin._id,
      mensaje,
      tipo: "solicitud",
      solicitudId: nuevaSolicitud._id,
    }).save();

    if(admin.email){
      await enviarCorreo({
        destino: admin.email,
        asunto: "Nueva solicitud de traslado - SIGMA",
        mensaje
      });
    }

  });
  
  await Promise.all(promesasNotificaciones);

  return nuevaSolicitud;
};



export const procesarSolicitudTrasladoService = async ({ solicitudId, aprobado, adminId }) => {
  const solicitud = await SolicitudTraslado.findById(solicitudId).populate("funcionario obraDestino");
  const admin = await Usuario.findById(adminId);
  
  if (!solicitud) throw new Error("La solicitud no existe");
  if (solicitud.estado !== "Pendiente") throw new Error("La solicitud ya fue procesada");


  solicitud.procesadoPor = adminId;
  solicitud.fechaProcesado = new Date();
  solicitud.estado = aprobado ? "Aprobada" : "Rechazada";


  await new AccionUsuario({
    usuario: adminId,
    accion: aprobado ? "Aprobó solicitud de traslado" : "Rechazó solicitud de traslado",
    recursoAfectado: `SolicitudTraslado ID: ${solicitud._id}`,
    detalles: {
      solicitanteId: solicitud.funcionario._id,
      nombreSolicitante: solicitud.funcionario.nombre,
      unidades: solicitud.unidades,
      obraDestino: solicitud.obraDestino.nombre
    }
  }).save();

  const mensaje = aprobado
    ? `Tu solicitud de traslado a "${solicitud.obraDestino.nombre}" fue autorizada por el administrador ${admin.nombre} ${admin.apellido}.`
    : `Tu solicitud de traslado a "${solicitud.obraDestino.nombre}" fue RECHAZADA por el administrador ${admin.nombre} ${admin.apellido}.`;

  await new Notificacion({
    usuario: solicitud.funcionario._id,
    mensaje,
    tipo: aprobado ? "solicitud_aprobada" : "respuesta",
    solicitudId: solicitud._id,
  }).save();

  if(solicitud.funcionario.email){

    await enviarCorreo({
      destino: solicitud.funcionario.email,
      asunto: aprobado 
        ? "Solicitud aprobada - SIGMA"
        : "Solicitud rechazada - SIGMA",
      mensaje
    });

  }

  await solicitud.save();

  return solicitud;
};




export const confirmarEntregaService = async ({ solicitudId, funcionarioId }) => {

  const solicitud = await SolicitudTraslado.findById(solicitudId)
    .populate("obraOrigen obraDestino funcionario procesadoPor");
  

  const funcionario = await Usuario.findById(funcionarioId);


  if (!solicitud) throw new Error("La solicitud no existe");
  if (solicitud.estado !== "Aprobada") throw new Error("La solicitud no está autorizada para entrega");


  solicitud.estado = "Completada";

  await solicitud.save();



  await Unidad.updateMany(
    { _id: { $in: solicitud.unidades } },
    { $set: { ubicacion: solicitud.obraDestino._id, estado: "Asignada" } }
  );



  const adminId = solicitud.procesadoPor ? solicitud.procesadoPor._id : null;



  const nuevaAccion = new AccionUsuario({
    usuario: adminId,
    accion: `Confirmación de traslado completado`,
    recursoAfectado: `SolicitudTraslado ID: ${solicitud._id}`,
    detalles: {
      funcionarioId: funcionario._id,
      nombreFuncionario: `${funcionario.nombre} ${funcionario.apellido}`,
      unidades: solicitud.unidades,
      obraOrigen: solicitud.obraOrigen.nombre,
      obraDestino: solicitud.obraDestino.nombre,
      fechaConfirmacion: new Date()
    }
  });
  
  await nuevaAccion.save();



  if (adminId) {

    const mensaje = `El funcionario ${funcionario.nombre} ${funcionario.apellido} confirmó la entrega de equipos en la obra "${solicitud.obraDestino.nombre}".`;

    await new Notificacion({
      usuario: adminId, 
      mensaje,
      tipo: "respuesta",
      solicitudId: solicitud._id,
    }).save();

    const admin = await Usuario.findById(adminId);

    if(admin?.email){

      await enviarCorreo({
        destino: admin.email,
        asunto: "Entrega confirmada - SIGMA",
        mensaje
      });

    }

  }


  return nuevaAccion;
};