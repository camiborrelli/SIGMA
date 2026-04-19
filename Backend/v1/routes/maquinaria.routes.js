import express from "express";
import {
  registrarMaquinariaController,
  getMaquinariasActivasController,
  getMaquinariasController,
  eliminarMaquinariaController,
} from "../controllers/maquinaria.controller.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarMaquinariaSchema } from "../validators/maquinaria.validators.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/",
  verificarToken,
  validateBody(registrarMaquinariaSchema),
  registrarMaquinariaController,
);
router.get("/activas", verificarToken, getMaquinariasActivasController);
router.get("/", verificarToken, getMaquinariasController);
router.delete("/:id", verificarToken, eliminarMaquinariaController);

export default router;
