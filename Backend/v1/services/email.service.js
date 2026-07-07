import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
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

export const enviarCorreo = async ({ destino, asunto, mensaje }) => {
  try {
    const contenido = /<\/?[a-z][\s\S]*>/i.test(mensaje)
      ? mensaje
      : `<p>${mensaje}</p>`;

    await transporter.sendMail({
      from: `SIGMA <${process.env.EMAIL_USER}>`,
      to: destino,
      subject: asunto,
      html: `
        <div>
          <h2>SIGMA</h2>
          ${contenido}
        </div>
      `,
    });

    console.log(`Correo enviado a: ${destino}`);
  } catch (error) {
    console.error("Error enviando correo:", error.message);
    throw error;
  }
};
