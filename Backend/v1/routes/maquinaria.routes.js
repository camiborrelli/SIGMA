import express from "express";
import {
  registrarMaquinariaController,
  getMaquinariasActivasController,
  getMaquinariasController,
  eliminarMaquinariaController,
  countMaquinariasController,
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
// Public summary endpoint (no token) for quick testing or public dashboards
router.get("/cantidad", verificarToken, countMaquinariasController);
router.get("/", verificarToken, getMaquinariasController);
router.delete("/:id", verificarToken, soloAdmin, eliminarMaquinariaController);

export default router;
