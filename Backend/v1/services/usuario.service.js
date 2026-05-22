import Usuario from "../models/usuario.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
