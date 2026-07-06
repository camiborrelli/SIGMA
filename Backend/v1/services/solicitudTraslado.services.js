import mongoose from "mongoose";
import SolicitudTraslado from "../models/SolicitudTraslado.js";
import Unidad from "../models/unidad.model.js";
import Usuario from "../models/usuario.model.js";
import Obra from "../models/obra.model.js";
import AccionUsuario from "../models/accionUsuario.model.js";
import { enviarCorreo } from "../services/email.service.js";
import { crearNotificacionService } from "./notificacion.services.js";

const idsUnicos = (ids = []) => [...new Set(ids.map((id) => String(id)))];

const validarObjectId = (id, campo) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`${campo} invalido`);
  }
};

const enviarCorreoSeguro = async (datosCorreo, contexto) => {
  try {
    await enviarCorreo(datosCorreo);
  } catch (error) {
    console.error(`No se pudo enviar correo de traslado (${contexto}):`, error.message);
  }
};

const validarDatosSolicitud = async ({ funcionarioId, obraOrigen, obraDestino, unidades }) => {
  if (!Array.isArray(unidades) || unidades.length === 0) {
    throw new Error("Debe seleccionar al menos una unidad");
  }

  validarObjectId(funcionarioId, "Funcionario");
  validarObjectId(obraOrigen, "Obra origen");
  validarObjectId(obraDestino, "Obra destino");

  if (String(obraOrigen) === String(obraDestino)) {
    throw new Error("La obra destino debe ser distinta a la obra origen");
  }

  const unidadesIds = idsUnicos(unidades);
  unidadesIds.forEach((unidadId) => validarObjectId(unidadId, "Unidad"));

  const [funcionario, origen, destino, admins, unidadesValidas] = await Promise.all([
    Usuario.findById(funcionarioId),
    Obra.findById(obraOrigen),
    Obra.findById(obraDestino),
    Usuario.find({ rol: "Admin" }),
    Unidad.find({ _id: { $in: unidadesIds }, ubicacion: obraOrigen }).select("_id"),
  ]);

  if (!funcionario) throw new Error("El funcionario no existe");
  if (!origen) throw new Error("La obra origen no existe");
  if (!destino) throw new Error("La obra destino no existe");
  if (destino.estado === "Finalizada") throw new Error("La obra destino esta finalizada");
  if (admins.length === 0) throw new Error("No hay administradores disponibles para procesar la solicitud");

  if (unidadesValidas.length !== unidadesIds.length) {
    throw new Error("Hay unidades que no pertenecen a la obra origen o no existen");
  }

  return {
    funcionario,
    admins,
    unidadesIds,
  };
};

export const crearSolicitudTrasladoService = async ({
  funcionarioId,
  obraOrigen,
  obraDestino,
  unidades,
}) => {
  const { funcionario, admins, unidadesIds } = await validarDatosSolicitud({
    funcionarioId,
    obraOrigen,
    obraDestino,
    unidades,
  });

  const nuevaSolicitud = await SolicitudTraslado.create({
    funcionario: funcionarioId,
    obraOrigen,
    obraDestino,
    unidades: unidadesIds,
  });

  const mensaje = `El funcionario ${funcionario.nombre} ${funcionario.apellido} ha solicitado un traslado de equipos hacia una nueva obra.`;

  await Promise.all(
    admins.map(async (admin) => {
      await crearNotificacionService({
        usuario: admin._id,
        mensaje,
        tipo: "solicitud",
        solicitudId: nuevaSolicitud._id,
      });

      if (admin.email) {
        await enviarCorreoSeguro(
          {
            destino: admin.email,
            asunto: "Nueva solicitud de traslado - SIGMA",
            mensaje,
          },
          "nueva solicitud",
        );
      }
    }),
  );

  return nuevaSolicitud;
};

export const procesarSolicitudTrasladoService = async ({
  solicitudId,
  aprobado,
  adminId,
}) => {
  validarObjectId(solicitudId, "Solicitud");
  validarObjectId(adminId, "Administrador");

  const [solicitud, admin] = await Promise.all([
    SolicitudTraslado.findById(solicitudId).populate("funcionario obraDestino"),
    Usuario.findById(adminId),
  ]);

  if (!solicitud) throw new Error("La solicitud no existe");
  if (!admin || admin.rol !== "Admin") throw new Error("Solo un administrador puede procesar la solicitud");
  if (solicitud.estado !== "Pendiente") throw new Error("La solicitud ya fue procesada");

  solicitud.procesadoPor = adminId;
  solicitud.fechaProcesado = new Date();
  solicitud.estado = aprobado ? "Aprobada" : "Rechazada";

  await new AccionUsuario({
    usuario: adminId,
    accion: aprobado ? "Aprobo solicitud de traslado" : "Rechazo solicitud de traslado",
    recursoAfectado: `SolicitudTraslado ID: ${solicitud._id}`,
    detalles: {
      solicitanteId: solicitud.funcionario._id,
      nombreSolicitante: solicitud.funcionario.nombre,
      unidades: solicitud.unidades,
      obraDestino: solicitud.obraDestino.nombre,
    },
  }).save();

  const mensaje = aprobado
    ? `Tu solicitud de traslado a "${solicitud.obraDestino.nombre}" fue autorizada por el administrador ${admin.nombre} ${admin.apellido}.`
    : `Tu solicitud de traslado a "${solicitud.obraDestino.nombre}" fue rechazada por el administrador ${admin.nombre} ${admin.apellido}.`;

  await crearNotificacionService({
    usuario: solicitud.funcionario._id,
    mensaje,
    tipo: aprobado ? "solicitud_aprobada" : "respuesta",
    solicitudId: solicitud._id,
  });

  if (solicitud.funcionario.email) {
    await enviarCorreoSeguro(
      {
        destino: solicitud.funcionario.email,
        asunto: aprobado ? "Solicitud aprobada - SIGMA" : "Solicitud rechazada - SIGMA",
        mensaje,
      },
      "respuesta de solicitud",
    );
  }

  await solicitud.save();

  return solicitud;
};

export const confirmarEntregaService = async ({ solicitudId, funcionarioId }) => {
  validarObjectId(solicitudId, "Solicitud");
  validarObjectId(funcionarioId, "Funcionario");

  const solicitud = await SolicitudTraslado.findById(solicitudId).populate(
    "obraOrigen obraDestino funcionario procesadoPor",
  );
  const funcionario = await Usuario.findById(funcionarioId);

  if (!solicitud) throw new Error("La solicitud no existe");
  if (!funcionario) throw new Error("El funcionario no existe");
  if (solicitud.estado !== "Aprobada") {
    throw new Error("La solicitud no esta autorizada para entrega");
  }
  if (String(solicitud.funcionario._id) !== String(funcionarioId)) {
    throw new Error("Solo el funcionario solicitante puede confirmar la entrega");
  }

  const unidadesIds = idsUnicos(solicitud.unidades);
  const resultadoTraslado = await Unidad.updateMany(
    { _id: { $in: unidadesIds }, ubicacion: solicitud.obraOrigen._id },
    { $set: { ubicacion: solicitud.obraDestino._id, estado: "Asignada" } },
  );

  if (resultadoTraslado.matchedCount !== unidadesIds.length) {
    throw new Error("No se pudieron trasladar todas las unidades solicitadas");
  }

  solicitud.estado = "Completada";
  await solicitud.save();

  const adminId = solicitud.procesadoPor?._id;

  const nuevaAccion = new AccionUsuario({
    usuario: funcionarioId,
    accion: "Confirmacion de traslado completado",
    recursoAfectado: `SolicitudTraslado ID: ${solicitud._id}`,
    detalles: {
      funcionarioId: funcionario._id,
      nombreFuncionario: `${funcionario.nombre} ${funcionario.apellido}`,
      procesadoPor: adminId,
      unidades: solicitud.unidades,
      obraOrigen: solicitud.obraOrigen.nombre,
      obraDestino: solicitud.obraDestino.nombre,
      fechaConfirmacion: new Date(),
    },
  });

  await nuevaAccion.save();

  if (adminId) {
    const mensaje = `El funcionario ${funcionario.nombre} ${funcionario.apellido} confirmo la entrega de equipos en la obra "${solicitud.obraDestino.nombre}".`;

    await crearNotificacionService({
      usuario: adminId,
      mensaje,
      tipo: "respuesta",
      solicitudId: solicitud._id,
    });

    const admin = await Usuario.findById(adminId);

    if (admin?.email) {
      await enviarCorreoSeguro(
        {
          destino: admin.email,
          asunto: "Entrega confirmada - SIGMA",
          mensaje,
        },
        "confirmacion de entrega",
      );
    }
  }

  return nuevaAccion;
};
