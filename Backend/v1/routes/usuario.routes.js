import express from "express";
import {
  register,
  login,
  cambiarRol,
  getUsuarios,
  darDeBajaUsuario,
  reactivarUsuario,
  cambiarContrasenia,
  verificarEmail,
  cambiarContraseniaSinLogin,
} from "../controllers/usuarioController.js";
import { getAccionesUsuarioController } from "../controllers/accionUsuario.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { soloAdmin } from "../middlewares/roles.js";

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post("/register", register);
router.post("/login", login);
router.post("/verificar-email", verificarEmail);

router.get(
  "/accionesUsuario",
  verificarToken,
  soloAdmin,
  getAccionesUsuarioController,
);
router.post("/:id/cambiar-contrasenia-recuperar", cambiarContraseniaSinLogin);
router.put("/:id/contrasenia", cambiarContrasenia);
router.put("/:id/rol", verificarToken, soloAdmin, cambiarRol);
router.put("/:id/baja", verificarToken, soloAdmin, darDeBajaUsuario);
router.put("/:id/reactivar", verificarToken, soloAdmin, reactivarUsuario);

// Rutas protegidas (con autenticación)
router.get("/", verificarToken, soloAdmin, getUsuarios);

export default router;
