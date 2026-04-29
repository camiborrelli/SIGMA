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
  getSoloMaquinariasController,
  getHerramientasController,
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
// Alias route expected by frontend: /maquinaria/disponibles
router.get("/disponibles", verificarToken, getMaquinariasActivasController);
router.get(
  "/mantenimiento",
  verificarToken,
  getMaquinariasMantenimientoController,
);
router.get("/tipo/maquina", verificarToken, getSoloMaquinariasController);
router.get("/tipo/herramienta", verificarToken, getHerramientasController);

router.get("/asignadas", verificarToken, getMaquinariasAsignadasController);
router.get("/bajas", verificarToken, getMaquinariasDadasDeBajaController);

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
router.get("/:id/reparaciones", verificarToken, getCantReparacionesController);
router.delete("/:id", verificarToken, soloAdmin, eliminarMaquinariaController);

export default router;
