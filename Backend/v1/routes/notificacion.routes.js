import express from "express";
import {
  obtenerNotificaciones,
  marcarNotificacionesLeidas,
  registrarPushToken,
  eliminarPushToken,
} from "../controllers/notificacion.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verificarToken, obtenerNotificaciones);

router.post("/push-token", verificarToken, registrarPushToken);

router.delete("/push-token", verificarToken, eliminarPushToken);

router.put("/leidas", verificarToken, marcarNotificacionesLeidas);

export default router;
