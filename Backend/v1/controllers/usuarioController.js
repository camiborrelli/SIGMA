import { registrarUsuario } from "../services/usuario.service.js";
import {
  loginUsuario,
  cambiarRolUsuario,
  obtenerUsuarios,
  darBajaUsuario,
  cambiarContraseñaUsuario,
  reactivarUsuarioService,
} from "../services/usuario.service.js";

export const register = async (req, res) => {
  try {
    const usuario = await registrarUsuario(req.body);

    //Ocultar password
    const { password, ...usuarioSinPassword } = usuario.toObject();

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    if (error.message === "El usuario ya está registrado") {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === "Todos los campos son obligatorios") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const login = async (req, res) => {
  try {
    const { usuario, token } = await loginUsuario(req.body);

    //Ocultar password
    const { password, ...usuarioSinPassword } = usuario.toObject();

    res.status(200).json({
      message: "Login exitoso",
      usuario: usuarioSinPassword,
      token,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const usuarioActualizado = await cambiarRolUsuario(id, rol);

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Rol actualizado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();

    res.status(200).json({
      usuarios,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuarios",
    });
  }
};

export const darDeBajaUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioActualizado = await darBajaUsuario(id);

    res.status(200).json({
      message: "Usuario dado de baja correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const reactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioActualizado = await reactivarUsuarioService(id);

    res.status(200).json({
      message: "Usuario reactivado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const cambiarContraseña = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaContraseña } = req.body;
    const usuarioActualizado = await cambiarContraseñaUsuario(
      id,
      nuevaContraseña,
    );

    res.status(200).json({
      message: "Contraseña actualizada correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
