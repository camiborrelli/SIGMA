import express from "express";
import {
  getUnidadesPorEquipoController,
  bajaUnidadController,
  agregarUnidadController,
  enviarAMantenimientoController,
  getGarantiaUnidadController,
  getStatsUnidadesController,
  getReparacionesUnidadController,
  asignarUnidadController,
} from "../controllers/unidad.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

// Rutas específicas primero
router.get("/equipo/:equipoId", verificarToken, getUnidadesPorEquipoController);

router.post("/baja/:id", verificarToken, bajaUnidadController);
router.post(
  "/mantenimiento/:id",
  verificarToken,
  enviarAMantenimientoController,
);
router.post("/agregar/:equipoId", verificarToken, agregarUnidadController);

// ✅ Ruta de asignar antes de las rutas genéricas
router.post("/asignar/:id", verificarToken, asignarUnidadController);

// Otras rutas
router.get("/garantia/:id", verificarToken, getGarantiaUnidadController);
router.get("/stats", verificarToken, getStatsUnidadesController);
router.get(
  "/:id/reparaciones",
  verificarToken,
  getReparacionesUnidadController,
);

export default router;
