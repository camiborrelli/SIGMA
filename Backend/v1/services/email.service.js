import nodemailer from "nodemailer";
import { lookup } from "dns/promises";

const SMTP_SEND_TIMEOUT_MS = Number(
  process.env.SMTP_TIMEOUT_MS || 60000,
);

const SMTP_HOST = "smtp.gmail.com";

const obtenerIpV4Gmail = async () => {
  const resultado = await lookup(SMTP_HOST, {
    family: 4,
  });

  return resultado.address;
};

const crearTransporter = async () => {
  const ipV4 = await obtenerIpV4Gmail();

  console.log(`Conectando Gmail SMTP mediante IPv4: ${ipV4}`);

  return nodemailer.createTransport({
    host: ipV4,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      servername: SMTP_HOST,
    },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 120000,
  });
};

let transporter;

const inicializarCorreo = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(
      "Servicio de correo sin credenciales: configura EMAIL_USER y EMAIL_PASSWORD",
    );
    return;
  }

  try {
    transporter = await crearTransporter();

    await transporter.verify();

    console.log("Servicio de correo listo para enviar mensajes");
  } catch (error) {
    console.error(
      "No se pudo verificar el servicio de correo:",
      error.message,
    );
  }
};

await inicializarCorreo();

const ejecutarConTimeout = async (promesa, mensajeError) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(mensajeError));
    }, SMTP_SEND_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promesa, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const enviarCorreo = async ({
  destino,
  asunto,
  mensaje,
}) => {
  try {
    if (!transporter) {
      throw new Error(
        "El servicio de correo no está disponible",
      );
    }

    const contenido = /<\/?[a-z][\s\S]*>/i.test(mensaje)
      ? mensaje
      : `<p>${mensaje}</p>`;

    const html = `
      <div>
        <h2>SIGMA</h2>
        ${contenido}
      </div>
    `;

    const mailOptions = {
      from: `SIGMA <${process.env.EMAIL_USER}>`,
      to: destino,
      subject: asunto,
      html,
    };

    const info = await ejecutarConTimeout(
      transporter.sendMail(mailOptions),
      "Timeout enviando el correo",
    );

    console.log("Correo procesado por SMTP:", {
      destino,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    if (
      Array.isArray(info.rejected) &&
      info.rejected.length > 0
    ) {
      throw new Error(
        `El servidor de correo rechazó el envío a: ${info.rejected.join(", ")}`,
      );
    }

    return info;
  } catch (error) {
    console.error("Error enviando correo:", error);
    throw error;
  }
};

export const enviarCorreoSeguro = async (
  datosCorreo,
  contexto = "",
) => {
  try {
    return await enviarCorreo(datosCorreo);
  } catch (error) {
    console.error(
      `No se pudo enviar correo (${contexto}):`,
      error.message,
    );

    return null;
  }
};