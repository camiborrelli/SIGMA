import nodemailer from "nodemailer";
import { lookup } from "dns/promises";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_CONNECTION_TIMEOUT_MS = Number(
  process.env.SMTP_CONNECTION_TIMEOUT_MS || 20000,
);
const SMTP_GREETING_TIMEOUT_MS = Number(
  process.env.SMTP_GREETING_TIMEOUT_MS || 20000,
);
const SMTP_SOCKET_TIMEOUT_MS = Number(
  process.env.SMTP_SOCKET_TIMEOUT_MS || 60000,
);
const SMTP_SEND_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS || 20000);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
  greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
  socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn(
    "Servicio de correo sin credenciales: configura EMAIL_USER y EMAIL_PASSWORD",
  );
}

transporter.verify((error, success) => {
  if (error) {
    console.error("No se pudo verificar el servicio de correo:", error.message);
    return;
  }

  if (success) {
    console.log("Servicio de correo listo para enviar mensajes");
  }
});

const ejecutarConTimeout = async (promesa, mensajeError) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(mensajeError)),
      SMTP_SEND_TIMEOUT_MS,
    );
  });

  try {
    return await Promise.race([promesa, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const esErrorDeConexion = (error) => {
  const mensaje = String(error?.message || "").toLowerCase();
  const codigosReintentables = new Set([
    "ENETUNREACH",
    "ETIMEDOUT",
    "ESOCKET",
    "ECONNECTION",
    "EAI_AGAIN",
  ]);

  return (
    codigosReintentables.has(error?.code) ||
    mensaje.includes("timeout") ||
    mensaje.includes("timed out") ||
    mensaje.includes("connection")
  );
};

const crearFallbackIPv4Transport = async () => {
  const addr = await lookup(SMTP_HOST, { family: 4 });

  console.warn(
    `Problema conectando con ${SMTP_HOST}, reintentando usando IPv4 ${addr.address}`,
  );

  return nodemailer.createTransport({
    host: addr.address,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      servername: SMTP_HOST,
    },
  });
};

export const enviarCorreo = async ({ destino, asunto, mensaje }) => {
  try {
    const contenido = /<\/?[a-z][\s\S]*>/i.test(mensaje)
      ? mensaje
      : `<p>${mensaje}</p>`;

    const mailOptions = {
      from: `SIGMA <${process.env.EMAIL_USER}>`,
      to: destino,
      subject: asunto,
      html: `
          <div>
            <h2>SIGMA</h2>
            ${contenido}
          </div>
        `,
    };

    const sendMailPromise = transporter.sendMail(mailOptions);

    let info;

    try {
      info = await ejecutarConTimeout(
        sendMailPromise,
        "Timeout enviando el correo de recuperacion",
      );
    } catch (err) {
      if (esErrorDeConexion(err)) {
        try {
          const fallbackTransport = await crearFallbackIPv4Transport();

          info = await ejecutarConTimeout(
            fallbackTransport.sendMail(mailOptions),
            "Timeout enviando el correo de recuperacion (fallback IPv4)",
          );
        } catch (err2) {
          throw err2;
        }
      } else {
        throw err;
      }
    }

    console.log("Correo procesado por SMTP:", {
      destino,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    if (Array.isArray(info.rejected) && info.rejected.length > 0) {
      throw new Error(
        `El servidor de correo rechazo el envio a: ${info.rejected.join(", ")}`,
      );
    }

    return info;
  } catch (error) {
    console.error("Error enviando correo:", error.message);
    throw error;
  }
};

export const enviarCorreoSeguro = async (datosCorreo, contexto = "") => {
  try {
    return await enviarCorreo(datosCorreo);
  } catch (error) {
    console.error(`No se pudo enviar correo (${contexto}):`, error.message);
    return null;
  }
};
