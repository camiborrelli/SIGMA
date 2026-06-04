import express from "express";
import {
  crearSolicitudTraslado,
  procesarSolicitudTraslado,
  confirmarEntrega,
} from "../controllers/solicitudTraslado.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/traslado", verificarToken, crearSolicitudTraslado);

router.put("/traslado/:id/procesar", verificarToken, procesarSolicitudTraslado);

router.post("/traslado/confirmar-entrega", verificarToken, confirmarEntrega);

export default router;