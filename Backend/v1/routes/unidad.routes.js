import express from "express";
import {
  getUnidadesPorEquipoController,
  bajaUnidadController,
  agregarUnidadController,
  enviarAMantenimientoController,
  finalizarMantenimientoController,
  getGarantiaUnidadController,
  getStatsUnidadesController,
  getReparacionesUnidadController,
  asignarUnidadController,
  eliminarUnidadController,
  actualizarFechaCompraController,
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
router.post(
  "/mantenimiento/finalizar/:id",
  verificarToken,
  finalizarMantenimientoController,
);
router.post("/agregar/:equipoId", verificarToken, agregarUnidadController);

// ✅ Ruta de asignar antes de las rutas genéricas
router.post("/asignar/:id", verificarToken, asignarUnidadController);
router.delete("/:id", verificarToken, eliminarUnidadController);

// Otras rutas
router.get("/garantia/:id", verificarToken, getGarantiaUnidadController);
router.get("/stats", verificarToken, getStatsUnidadesController);
router.get(
  "/:id/reparaciones",
  verificarToken,
  getReparacionesUnidadController,
);
router.put(
  "/fecha-compra/:id",
  verificarToken,
  actualizarFechaCompraController
);

export default router;
