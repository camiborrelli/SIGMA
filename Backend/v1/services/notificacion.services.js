import Notificacion from "../models/Notificacion.js";
import Usuario from "../models/usuario.model.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const DEFAULT_FRONTEND_URL = "https://sigma-front-five.vercel.app";
const NOTIFICATION_CHANNEL_ID = "sigma-alerts";

const obtenerBaseUrlSistema = () =>
  (
    process.env.SIGMA_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    DEFAULT_FRONTEND_URL
  ).replace(/\/+$/, "");

const obtenerId = (valor) => {
  if (!valor) return null;
  if (typeof valor === "object" && valor._id) return String(valor._id);
  return String(valor);
};

const construirUrl = (path) => `${obtenerBaseUrlSistema()}${path}`;

export const obtenerUrlNotificacion = (notificacion) => {
  const tipo = notificacion?.tipo || "sistema";
  const notificacionId = obtenerId(notificacion?._id);
  const solicitudId = obtenerId(notificacion?.solicitudId);
  const unidadId = obtenerId(notificacion?.unidadId);

  if (tipo === "garantia_por_vencer") {
    return unidadId
      ? construirUrl(`/garantia/${unidadId}`)
      : construirUrl("/garantias-vencer");
  }

  if (solicitudId) {
    const params = new URLSearchParams({ solicitud: solicitudId });

    if (notificacionId) {
      params.set("notificacion", notificacionId);
    }

    return construirUrl(`/dashboard?${params.toString()}`);
  }

  return construirUrl("/dashboard");
};

const serializarNotificacion = (notificacion) => {
  const plana =
    typeof notificacion?.toObject === "function"
      ? notificacion.toObject()
      : notificacion;

  return {
    ...plana,
    url: obtenerUrlNotificacion(plana),
  };
};

const esExpoPushTokenValido = (token) =>
  typeof token === "string" &&
  /^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/.test(token);

const partirEnLotes = (items, tamano = 100) => {
  const lotes = [];

  for (let i = 0; i < items.length; i += tamano) {
    lotes.push(items.slice(i, i + tamano));
  }

  return lotes;
};

const eliminarTokensNoRegistrados = async (tickets = [], mensajes = []) => {
  const tokensInvalidos = tickets
    .map((ticket, index) =>
      ticket?.status === "error" &&
      ticket?.details?.error === "DeviceNotRegistered"
        ? mensajes[index]?.to
        : null,
    )
    .filter(Boolean);

  if (tokensInvalidos.length === 0) return;

  await Usuario.updateMany(
    {},
    {
      $pull: {
        pushTokens: {
          token: { $in: tokensInvalidos },
        },
      },
    },
  );
};

const enviarLoteExpo = async (mensajes) => {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mensajes),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Expo Push rechazo el lote:", response.status, body);
    return;
  }

  await eliminarTokensNoRegistrados(body.data, mensajes);
};

export const registrarPushTokenService = async (usuarioId, data = {}) => {
  const { token, platform = "unknown", deviceName = "" } = data;

  if (!esExpoPushTokenValido(token)) {
    throw new Error("Token push invalido");
  }

  await Usuario.updateMany(
    { _id: { $ne: usuarioId }, "pushTokens.token": token },
    { $pull: { pushTokens: { token } } },
  );

  await Usuario.updateOne(
    { _id: usuarioId },
    { $pull: { pushTokens: { token } } },
  );

  const pushToken = {
    token,
    platform: ["android", "ios", "web"].includes(platform)
      ? platform
      : "unknown",
    deviceName,
    createdAt: new Date(),
    lastSeenAt: new Date(),
  };

  await Usuario.updateOne(
    { _id: usuarioId },
    { $push: { pushTokens: pushToken } },
  );

  return pushToken;
};

export const eliminarPushTokenService = async (usuarioId, token) => {
  if (!token) return null;

  return Usuario.updateOne(
    { _id: usuarioId },
    { $pull: { pushTokens: { token } } },
  );
};

export const enviarPushANotificacionService = async (notificacion) => {
  console.log("=== ENVIANDO PUSH ===");
  try {
    const notificacionPlana = serializarNotificacion(notificacion);
    const usuario = await Usuario.findById(notificacionPlana.usuario)
      .select("pushTokens")
      .lean();

    const tokens = (usuario?.pushTokens || [])
      .map((item) => item.token)
      .filter(esExpoPushTokenValido);

    if (tokens.length === 0) return;

    const data = {
      url: notificacionPlana.url,
      tipo: notificacionPlana.tipo,
      notificacionId: obtenerId(notificacionPlana._id),
      solicitudId: obtenerId(notificacionPlana.solicitudId),
      unidadId: obtenerId(notificacionPlana.unidadId),
    };

    const mensajes = tokens.map((token) => ({
      to: token,
      title: "SIGMA",
      body: notificacionPlana.mensaje,
      data,
      channelId: NOTIFICATION_CHANNEL_ID,
      priority: "high",
      sound: "default",
      ttl: 60 * 60 * 24 * 30,
    }));

    for (const lote of partirEnLotes(mensajes)) {
      await enviarLoteExpo(lote);
    }
  } catch (error) {
    console.error("No se pudo enviar push de notificacion:", error.message);
  }
};

export const crearNotificacionService = async (data) => {
  const notificacion = await Notificacion.create(data);
  await enviarPushANotificacionService(notificacion);
  return notificacion;
};

export const obtenerNotificacionesService = async (usuarioId) => {
  const notificaciones = await Notificacion.find({
    usuario: usuarioId,
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate({
      path: "unidadId",
      populate: [
        {
          path: "equipo",
        },
        {
          path: "ubicacion",
        },
      ],
    })
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

  return notificaciones.map(serializarNotificacion);
};

export const marcarNotificacionesLeidasService = async (usuarioId) => {
  const resultado = await Notificacion.updateMany(
    {
      usuario: usuarioId,
      leida: false,
    },
    {
      $set: { leida: true },
    },
  );

  return resultado;
};
