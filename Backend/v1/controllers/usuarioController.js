import { registrarUsuario } from "../services/usuario.service.js";
import {
  loginUsuario,
  cambiarRolUsuario,
  obtenerUsuarios,
  darBajaUsuario,
  cambiarContraseniaUsuario,
  reactivarUsuarioService,
  getUsuarioPorEmail,
  solicitarRecuperacionContraseniaService,
  restablecerContraseniaConTokenService,
} from "../services/usuario.service.js";
import bcrypt from "bcrypt";
import Usuario from "../models/usuario.model.js";

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

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Usuario dado de baja correctamente",
      usuario: usuarioSinPassword,
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

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Usuario reactivado correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// export const recuperarContraseña = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const usuario = await getUsuarioPorEmail(email);
//     if (!usuario) {
//       return res.status(404).json({ error: "Usuario no encontrado" });
//     }
//     // NO devolver la contraseña, solo confirmar que se envió email
//     res.status(200).json({
//       message: "Si el email existe en el sistema, recibirás instrucciones de recuperación",
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Error al procesar la solicitud",
//     });
//   }
// };

export const verificarEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const usuario = await getUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(404).json({ error: "Email o contraseña incorrectos" });
    }

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(404).json({ error: "Email o contraseña incorrectos" });
    }

    res.status(200).json({
      message: "Email y contraseña verificados correctamente",
      existe: true,
      usuarioId: usuario._id,
    });
  } catch (error) {
    console.error("Error al verificar email:", error);
    res.status(500).json({
      error: "Error al verificar email",
    });
  }
};

export const solicitarRecuperacionContrasenia = async (req, res) => {
  try {
    const { email, frontendUrl } = req.body;
    const resultado = await solicitarRecuperacionContraseniaService(
      email,
      frontendUrl,
    );

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error en solicitarRecuperacionContrasenia:", error);
    res.status(500).json({
      error: error.message || "Error al solicitar recuperacion de contrasenia",
    });
  }
};

export const restablecerContrasenia = async (req, res) => {
  try {
    const { token } = req.query;
    const { nuevaContrasenia, confirmarContrasenia } = req.body;

    if (!nuevaContrasenia || !confirmarContrasenia) {
      return res.status(400).json({
        error: "La nueva contrasenia y su confirmacion son requeridas",
      });
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      return res.status(400).json({ error: "Las contrasenias no coinciden" });
    }

    const usuarioActualizado = await restablecerContraseniaConTokenService(
      token,
      nuevaContrasenia,
    );

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Contrasenia restablecida correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en restablecerContrasenia:", error);
    res.status(400).json({
      error: error.message || "Error al restablecer contrasenia",
    });
  }
};

export const cambiarContraseniaSinLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaContraseña } = req.body;

    console.log("ID:", id);
    console.log("Body recibido:", req.body);
    console.log("nuevaContraseña:", nuevaContraseña);

    if (!nuevaContraseña) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    if (nuevaContraseña.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordHash = await bcrypt.hash(nuevaContraseña, 10);
    usuario.password = passwordHash;
    const usuarioActualizado = await usuario.save();

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Contraseña cambiada exitosamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en cambiarContraseniaSinLogin:", error);
    res.status(500).json({
      error: error.message || "Error al cambiar contraseña",
    });
  }
};

export const cambiarContrasenia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaContrasenia } = req.body;
    const { confirmarContrasenia } = req.body;

    if (!nuevaContrasenia || !confirmarContrasenia) {
      return res.status(400).json({
        error: "La nueva contraseña y su confirmación son requeridas",
      });
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const usuarioActualizado = await cambiarContraseniaUsuario(
      id,
      nuevaContrasenia,
    );

    const { password, ...usuarioSinPassword } = usuarioActualizado.toObject();

    res.status(200).json({
      message: "Contraseña actualizada correctamente",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
