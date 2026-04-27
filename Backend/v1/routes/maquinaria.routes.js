import express from "express";
import {
  registrarMaquinariaController,
  getMaquinariasActivasController,
  getMaquinariasController,
  eliminarMaquinariaController,
  countMaquinariasController,
  getMaquinariasMantenimientoController,
  getMaquinariasAsignadasController,
  getMaquinariasDadasDeBajaController,
  asignarMaquinaAmantenimientoController,
  getGarantiaMaquinaController,
  getMaquinariaByIdController,
} from "../controllers/maquinaria.controller.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarMaquinariaSchema } from "../validators/maquinaria.validators.js";
import { verificarToken } from "../middlewares/auth.js";
import { soloAdmin } from "../middlewares/roles.js";

const router = express.Router();

router.post(
  "/",
  verificarToken,
  soloAdmin,
  validateBody(registrarMaquinariaSchema),
  registrarMaquinariaController,
);
router.get("/activas", verificarToken, getMaquinariasActivasController);
router.get(
  "/mantenimiento",
  verificarToken,
  getMaquinariasMantenimientoController,
);
router.get("/asignadas", verificarToken, getMaquinariasAsignadasController);
router.get("/bajas", verificarToken, getMaquinariasDadasDeBajaController);

// Public summary endpoint (no token) for quick testing or public dashboards
router.get("/cantidad", verificarToken, countMaquinariasController);
router.get("/", verificarToken, getMaquinariasController);

router.post(
  "/mantenimiento/:id",
  verificarToken,
  soloAdmin,
  asignarMaquinaAmantenimientoController,
);
router.get("/garantia/:id", verificarToken, getGarantiaMaquinaController);
router.get("/:id", verificarToken, getMaquinariaByIdController);
router.delete("/:id", verificarToken, soloAdmin, eliminarMaquinariaController);

export default router;
