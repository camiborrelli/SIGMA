import express from "express";
import { register, login, cambiarRol } from "../controllers/usuarioController.js";
import { verificarToken } from "../middlewares/auth.js";
import { soloAdmin } from "../middlewares/roles.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put(
  "/:id/rol",
  verificarToken,
  soloAdmin,
  cambiarRol
);

export default router;
