import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


export const enviarCorreo = async ({ destino, asunto, mensaje }) => {

  try {

    await transporter.sendMail({
      from: `SIGMA <${process.env.EMAIL_USER}>`,
      to: destino,
      subject: asunto,
      html: `
        <div>
          <h2>SIGMA</h2>
          <p>${mensaje}</p>
        </div>
      `
    });

    console.log(`Correo enviado a: ${destino}`);

  } catch (error) {

    console.error("Error enviando correo:", error.message);
    throw error;

  }

};