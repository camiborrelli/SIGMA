const BREVO_API_KEY = process.env.BREVO_API_KEY;

const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;

const BREVO_FROM_NAME =
  process.env.BREVO_FROM_NAME || "SIGMA";

if (!BREVO_API_KEY) {
  console.warn(
    "Servicio de correo sin credenciales: configura BREVO_API_KEY",
  );
} else {
  console.log("Servicio de correo configurado con Brevo API");
}

export const enviarCorreo = async ({
  destino,
  asunto,
  mensaje,
}) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error(
        "BREVO_API_KEY no está configurada",
      );
    }

    if (!BREVO_FROM_EMAIL) {
      throw new Error(
        "BREVO_FROM_EMAIL no está configurado",
      );
    }

    if (!destino) {
      throw new Error(
        "El destinatario del correo es requerido",
      );
    }

    const contenido = /<\/?[a-z][\s\S]*>/i.test(mensaje)
      ? mensaje
      : `<p>${mensaje}</p>`;

    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        "
      >
        <h2 style="color: #333;">SIGMA</h2>

        ${contenido}

        <hr />

        <p style="font-size: 12px; color: #777;">
          Este correo fue enviado automáticamente por SIGMA.
        </p>
      </div>
    `;

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: BREVO_FROM_NAME,
            email: BREVO_FROM_EMAIL,
          },
          to: [
            {
              email: destino,
            },
          ],
          subject: asunto,
          htmlContent: html,
        }),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.code ||
          "No se pudo enviar el correo",
      );
    }

    console.log("Correo procesado por Brevo:", {
      destino,
      messageId: data.messageId,
    });

    return data;
  } catch (error) {
    console.error(
      "Error enviando correo:",
      error.message,
    );

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