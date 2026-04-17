import { registrarUsuario } from "../services/usuarioService.js";
import { loginUsuario } from "../services/usuarioService.js";

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
    res.status(400).json({
      error: error.message,
    });
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