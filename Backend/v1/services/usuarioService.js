import Usuario from "../models/usuario.model.js";
import bcrypt from "bcrypt";

export const registrarUsuario = async (data) => {
  const { nombre, apellido, email, password } = data;

  //Validaciones
  if (!nombre || !apellido || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  //Verificar si ya existe
  const existe = await Usuario.findOne({ email });
  if (existe) {
    throw new Error("El usuario ya está registrado");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  //Crear usuario
  const nuevoUsuario = new Usuario({
    nombre,
    apellido,
    email,
    password: passwordHash,
  });

  return await nuevoUsuario.save();
};