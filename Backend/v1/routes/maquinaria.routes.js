import express from "express";
import {
  registrarMaquinariaController,
  getMaquinariasActivasController,
  getMaquinariasController,
  eliminarMaquinariaController,
} from "../controllers/maquinaria.controller.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarMaquinariaSchema } from "../validators/maquinaria.validators.js";

const router = express.Router();

router.post(
  "/",
  validateBody(registrarMaquinariaSchema),
  registrarMaquinariaController,
);
router.get("/activas", getMaquinariasActivasController);
router.get("/", getMaquinariasController);
router.delete("/:id", eliminarMaquinariaController);

export default router;
