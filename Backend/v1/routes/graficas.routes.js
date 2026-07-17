import { Router } from "express";
import {
  getResumenGraficasController,
  getDistribucionUnidadesPorEstadoController,
  getMaquinariaPorObraController,
  getEquiposMasEnMantenimientoController,
} from "../controllers/graficas.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = Router();

router.get("/resumen", verificarToken, getResumenGraficasController);

router.get(
  "/unidades-estado",
  verificarToken,
  getDistribucionUnidadesPorEstadoController
);

router.get(
  "/maquinaria-obra",
  verificarToken,
  getMaquinariaPorObraController
);

router.get(
  "/equipos-mantenimiento",
  verificarToken,
  getEquiposMasEnMantenimientoController
);

export default router;
