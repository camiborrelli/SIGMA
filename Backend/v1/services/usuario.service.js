import Usuario from "../models/usuario.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as emailService from "./email.service.js";

const DEFAULT_FRONTEND_URL = "https://sigma-front-five.vercel.app";

const normalizarBaseUrl = (frontendUrl) => {
  const portLocal = process.env.PORT || 5001;
  const urlBase =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SIGMA_BACKEND_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${portLocal}`;

  try {
    const url = new URL(urlBase);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Protocolo invalido");
    }

    return url.origin.replace(/\/+$/, "");
  } catch {
    return `http://localhost:${portLocal}`;
  }
};

const construirUrlRecuperacion = (token, frontendUrl) =>
  `${normalizarBaseUrl(frontendUrl)}/restablecer-contrasenia?token=${encodeURIComponent(token)}`;

export const registrarUsuario = async (data) => {
  const { nombre, apellido, email, password, rol } = data;

  //Validaciones
  if (!nombre || !apellido || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  //Verificar si ya existe
  const existe = await Usuario.findOne({ email });
  if (existe) {
    throw new Error("El usuario ya está registrado");
  }

  //Hash de password
  const passwordHash = await bcrypt.hash(password, 10);

  //Crear usuario
  const nuevoUsuario = new Usuario({
    nombre,
    apellido,
    email,
    password: passwordHash,
    rol: rol || "Funcionario",
  });

  return await nuevoUsuario.save();
};

export const loginUsuario = async ({ email, password }) => {
  //Validaciones
  if (!email || !password) {
    throw new Error("Email y contraseña son obligatorios");
  }

  //Buscar usuario
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    throw new Error("Credenciales inválidas");
  }

  //Comparar password
  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new Error("Credenciales inválidas");
  }

  //Generar token
  const token = jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { usuario, token };
};

export const cambiarRolUsuario = async (idUsuario, nuevoRol) => {
  //Validar rol
  if (!["Admin", "Funcionario"].includes(nuevoRol)) {
    throw new Error("Rol inválido");
  }

  const usuario = await Usuario.findById(idUsuario);

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  usuario.rol = nuevoRol;

  return await usuario.save();
};

export const obtenerUsuarios = async () => {
  return await Usuario.find({ rol: "Funcionario" }).select("-password");
};

export const darBajaUsuario = async (id) => {
  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    usuario.estado = "Inactivo";

    return await usuario.save();
  } catch (err) {
    throw err;
  }
};

export const reactivarUsuarioService = async (id) => {
  try {
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    usuario.estado = "Activo";

    return await usuario.save();
  } catch (err) {
    throw err;
  }
};

export const cambiarContraseniaUsuario = async (id, nuevaContrasenia) => {
  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }
    const passwordHash = await bcrypt.hash(nuevaContrasenia, 10);
    usuario.password = passwordHash;
    return await usuario.save();
  } catch (err) {
    throw err;
  }
};

export const getUsuarioPorEmail = async (email) => {
  try {
    const usuario = await Usuario.findOne({ email });
    return usuario; // Devuelve null si no existe, en lugar de lanzar error
  } catch (err) {
    throw err;
  }
};

export const solicitarRecuperacionContraseniaService = async (
  email,
  frontendUrl,
) => {
  if (!email) {
    throw new Error("El email es requerido");
  }

  const emailNormalizado = email.trim().toLowerCase();
  const usuario = await Usuario.findOne({ email: emailNormalizado });

  if (!usuario) {
    return {
      mensaje:
        "Si el correo existe en el sistema, recibirás un enlace para restablecer la contraseña",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiracion = new Date(Date.now() + 60 * 60 * 1000);

  usuario.resetPasswordToken = tokenHash;
  usuario.resetPasswordExpires = expiracion;
  await usuario.save();

  const enlace = construirUrlRecuperacion(token, frontendUrl);

  await emailService.enviarCorreo({
    destino: usuario.email,
    asunto: "Recuperacion de contrasenia - SIGMA",
    mensaje: `
      <p>Hola ${usuario.nombre},</p>
      <p>Recibimos una solicitud para restablecer tu contrasenia.</p>
      <p>Haz clic en este enlace para continuar:</p>
      <p><a href="${enlace}">${enlace}</a></p>
      <p>Este enlace vence en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  });

  return {
    mensaje:
      "Si el correo existe en el sistema, recibirás un enlace para restablecer la contraseña",
  };
};

export const restablecerContraseniaConTokenService = async (
  token,
  nuevaContrasenia,
) => {
  if (!token) {
    throw new Error("El token es requerido");
  }

  if (!nuevaContrasenia || nuevaContrasenia.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const usuario = await Usuario.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!usuario) {
    throw new Error("El enlace de recuperacion es invalido o expiro");
  }

  const passwordHash = await bcrypt.hash(nuevaContrasenia, 10);
  usuario.password = passwordHash;
  usuario.resetPasswordToken = null;
  usuario.resetPasswordExpires = null;

  await usuario.save();

  return usuario;
};
