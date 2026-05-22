import express from "express";
import {
  register,
  login,
  cambiarRol,
  getUsuarios,
  darDeBajaUsuario,
  reactivarUsuario,
  cambiarContraseña,
} from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/auth.js";
import { soloAdmin } from "../middlewares/roles.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login); // ruta es https

router.put("/:id/rol", verificarToken, soloAdmin, cambiarRol);
router.put("/:id/baja", verificarToken, soloAdmin, darDeBajaUsuario);
router.put("/:id/reactivar", verificarToken, soloAdmin, reactivarUsuario);
router.put("/:id/contraseña", verificarToken, cambiarContraseña);

router.get("/", verificarToken, soloAdmin, getUsuarios);

export default router;
