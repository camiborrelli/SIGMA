import Unidad from "../models/unidad.model.js";
import Usuario from "../models/usuario.model.js";
import Notificacion from "../models/Notificacion.js";
import { enviarCorreo } from "./email.service.js";
import {
  crearNotificacionService,
  enviarPushANotificacionService,
} from "./notificacion.services.js";

const DIAS_AVISO_GARANTIA = 30;
const MS_DIA = 24 * 60 * 60 * 1000;

let monitorIniciado = false;

const inicioDelDia = (fecha) => {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });

const normalizarDiasAviso = (dias = DIAS_AVISO_GARANTIA) => {
  const numeroDias = Number(dias);
  return Number.isFinite(numeroDias)
    ? Math.max(1, numeroDias)
    : DIAS_AVISO_GARANTIA;
};

export const calcularFechaFinGarantia = (fechaCompra) => {
  const fechaFin = new Date(fechaCompra);
  fechaFin.setFullYear(fechaFin.getFullYear() + 1);
  return fechaFin;
};

export const calcularDiasRestantesGarantia = (
  fechaFinGarantia,
  desde = new Date(),
) =>
  Math.ceil(
    (inicioDelDia(fechaFinGarantia) - inicioDelDia(desde)) / MS_DIA,
  );

const formatearFecha = (fecha) =>
  new Intl.DateTimeFormat("es-UY").format(new Date(fecha));

const getNombreEquipo = (equipo) => {
  if (!equipo || typeof equipo !== "object") return "Equipo sin nombre";
  return equipo.nombre || equipo.codigo || "Equipo sin nombre";
};

const getCodigoEquipo = (equipo) => {
  if (!equipo || typeof equipo !== "object") return null;
  return equipo.codigo || equipo.modelo || null;
};

const getNombreUbicacion = (ubicacion) => {
  if (!ubicacion) return "Sin asignar";
  if (typeof ubicacion === "object") return ubicacion.nombre || "Sin asignar";
  return String(ubicacion);
};

const normalizarGarantia = (unidad, ahora = new Date()) => {
  const fechaFinGarantia = calcularFechaFinGarantia(unidad.fechaCompra);
  const diasRestantes = calcularDiasRestantesGarantia(
    fechaFinGarantia,
    ahora,
  );

  return {
    _id: unidad._id,
    identificador: unidad.identificador,
    etiqueta: unidad.etiqueta,
    descripcion: unidad.descripcion,
    estado: unidad.estado,
    fechaCompra: unidad.fechaCompra,
    fechaFinGarantia,
    diasRestantes,
    equipo:
      unidad.equipo && typeof unidad.equipo === "object"
        ? {
            _id: unidad.equipo._id,
            nombre: unidad.equipo.nombre,
            codigo: unidad.equipo.codigo,
            modelo: unidad.equipo.modelo,
            tipo: unidad.equipo.tipo,
          }
        : unidad.equipo,
    ubicacion:
      unidad.ubicacion && typeof unidad.ubicacion === "object"
        ? {
            _id: unidad.ubicacion._id,
            nombre: unidad.ubicacion.nombre,
          }
        : unidad.ubicacion,
  };
};

export const obtenerGarantiasPorVencer = async (
  dias = DIAS_AVISO_GARANTIA,
) => {
  const diasAviso = normalizarDiasAviso(dias);

  const unidades = await Unidad.find({
    fechaCompra: { $exists: true, $ne: null },
    estado: { $ne: "Dada de Baja" },
  })
    .populate("equipo")
    .populate("ubicacion")
    .lean();

  const ahora = new Date();

  return unidades
    .map((unidad) => normalizarGarantia(unidad, ahora))
    .filter(
      (garantia) =>
        garantia.diasRestantes >= 0 && garantia.diasRestantes <= diasAviso,
    )
    .sort((a, b) => {
      if (a.diasRestantes !== b.diasRestantes) {
        return a.diasRestantes - b.diasRestantes;
      }
      return String(a.identificador || "").localeCompare(
        String(b.identificador || ""),
      );
    });
};

const crearMensajeNotificacion = (garantia) => {
  const equipo = getNombreEquipo(garantia.equipo);
  const codigo = getCodigoEquipo(garantia.equipo);
  const detalleEquipo = codigo ? `${equipo} (${codigo})` : equipo;

  return `La garantia de la unidad ${garantia.identificador} - ${detalleEquipo} vence el ${formatearFecha(
    garantia.fechaFinGarantia,
  )}. Faltan ${garantia.diasRestantes} dia(s).`;
};

const crearMensajeCorreo = (garantias, diasAviso = DIAS_AVISO_GARANTIA) => {
  const items = garantias
    .map((garantia) => {
      const equipo = escapeHtml(getNombreEquipo(garantia.equipo));
      const codigo = getCodigoEquipo(garantia.equipo);
      const codigoTexto = codigo ? ` - ${escapeHtml(codigo)}` : "";
      const ubicacion = escapeHtml(getNombreUbicacion(garantia.ubicacion));

      return `
        <li>
          <strong>${escapeHtml(garantia.identificador)}</strong>
          ${equipo}${codigoTexto}
          <br />
          Vence: ${formatearFecha(garantia.fechaFinGarantia)}
          (${garantia.diasRestantes} dia(s) restantes)
          <br />
          Ubicacion: ${ubicacion}
        </li>
      `;
    })
    .join("");

  return `
    <p>Hay ${garantias.length} garantia(s) que vencen dentro de los proximos ${diasAviso} dias.</p>
    <ul>${items}</ul>
  `;
};

export const notificarGarantiasPorVencer = async (
  dias = DIAS_AVISO_GARANTIA,
) => {
  const diasAviso = normalizarDiasAviso(dias);
  const garantias = await obtenerGarantiasPorVencer(diasAviso);

  if (garantias.length === 0) {
    return {
      garantiasDetectadas: 0,
      notificacionesCreadas: 0,
      correosEnviados: 0,
      erroresCorreo: [],
    };
  }

  const admins = await Usuario.find({
    rol: "Admin",
  })
    .select("nombre apellido email")
    .lean();

  let notificacionesCreadas = 0;
  let correosEnviados = 0;
  const erroresCorreo = [];

  for (const admin of admins) {
    const garantiasParaCorreo = [];
    const notificacionesParaMarcar = [];

    for (const garantia of garantias) {
      const filtroNotificacion = {
        usuario: admin._id,
        tipo: "garantia_por_vencer",
        unidadId: garantia._id,
        fechaVencimientoGarantia: garantia.fechaFinGarantia,
      };

      let notificacion = await Notificacion.findOne(filtroNotificacion)
  .select(
    "_id usuario mensaje tipo unidadId solicitudId correoEnviado pushEnviadoAt pushIntentadoAt pushTokensIntentados pushErrores",
  );

      if (!notificacion) {
        notificacion = await crearNotificacionService({
          usuario: admin._id,
          mensaje: crearMensajeNotificacion(garantia),
          tipo: "garantia_por_vencer",
          unidadId: garantia._id,
          fechaVencimientoGarantia: garantia.fechaFinGarantia,
          correoEnviado: false,
        });

        notificacionesCreadas += 1;
      }

      if (!notificacion.pushEnviadoAt) {
        const resultado = await enviarPushANotificacionService(notificacion);

        await Notificacion.findByIdAndUpdate(notificacion._id, {
          $set: {
            pushIntentadoAt: new Date(),
            pushTokensIntentados: resultado.tokens,
            pushErrores: resultado.errores,
            ...(resultado.enviados > 0 && {
              pushEnviadoAt: new Date(),
            }),
          },
        });
      }

      if (!notificacion.correoEnviado) {
        garantiasParaCorreo.push(garantia);
        notificacionesParaMarcar.push(notificacion._id);
      }
    }

    if (!admin.email || garantiasParaCorreo.length === 0) continue;

    try {
      await enviarCorreo({
        destino: admin.email,
        asunto: "Garantias por vencer - SIGMA",
        mensaje: crearMensajeCorreo(garantiasParaCorreo, diasAviso),
      });
      await Notificacion.updateMany(
        { _id: { $in: notificacionesParaMarcar } },
        {
          $set: {
            correoEnviado: true,
            correoEnviadoAt: new Date(),
          },
        },
      );
      correosEnviados += 1;
    } catch (error) {
      erroresCorreo.push({
        usuario: admin._id,
        email: admin.email,
        error: error.message,
      });
    }
  }

  return {
    garantiasDetectadas: garantias.length,
    notificacionesCreadas,
    correosEnviados,
    erroresCorreo,
  };
};

export const iniciarMonitorGarantiasPorVencer = () => {
  if (monitorIniciado) return;

  monitorIniciado = true;

  const intervalo =
    Number(process.env.GARANTIAS_CHECK_INTERVAL_MS) || 24 * 60 * 60 * 1000;
  const demoraInicial = Number(process.env.GARANTIAS_CHECK_DELAY_MS) || 5000;

  const ejecutar = async () => {
    try {
      const resultado = await notificarGarantiasPorVencer();
      if (
        resultado.notificacionesCreadas > 0 ||
        resultado.correosEnviados > 0
      ) {
        console.log("Avisos de garantia por vencer:", resultado);
      }
    } catch (error) {
      console.error("Error revisando garantias por vencer:", error.message);
    }
  };

  const timeout = setTimeout(ejecutar, demoraInicial);
  if (typeof timeout.unref === "function") timeout.unref();

  const interval = setInterval(ejecutar, intervalo);
  if (typeof interval.unref === "function") interval.unref();
};
