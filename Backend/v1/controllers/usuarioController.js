import { registrarUsuario } from "../services/usuarioService.js";

export const register = async (req, res) => {
  try {
    const usuario = await registrarUsuario(req.body);

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};