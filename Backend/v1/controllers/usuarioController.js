import { registrarUsuario } from "../services/usuario.service.js";
import { loginUsuario } from "../services/usuario.service.js";

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
