const RESEND_API_KEY = process.env.RESEND_API_KEY;

const RESEND_FROM =
process.env.RESEND_FROM || "SIGMA <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
console.warn(
"Servicio de correo sin credenciales: configura RESEND_API_KEY",
);
} else {
console.log("Servicio de correo configurado con Resend API");
}

export const enviarCorreo = async ({
destino,
asunto,
mensaje,
}) => {
try {
if (!RESEND_API_KEY) {
throw new Error(
"RESEND_API_KEY no está configurada",
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

const response = await fetch(
  "https://api.resend.com/emails",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [destino],
      subject: asunto,
      html,
    }),
  },
);

const data = await response.json().catch(() => ({}));

if (!response.ok) {
  throw new Error(
    data?.message ||
      data?.error ||
      "No se pudo enviar el correo",
  );
}

console.log("Correo procesado por Resend:", {
  destino,
  id: data.id,
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
