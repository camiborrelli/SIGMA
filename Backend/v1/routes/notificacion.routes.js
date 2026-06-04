import express from "express";
import {
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
} from "../controllers/notificacion.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verificarToken, obtenerNotificaciones);

router.put("/leidas", verificarToken, marcarNotificacionesLeidas);

export default router;