import express from "express";
import {
  registrarMaquinariaController,
  getMaquinariasActivasController,
  eliminarMaquinariaController,
} from "../controllers/maquinaria.controller.js";
// import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarMaquinariaSchema } from "../validators/maquinaria.validators.js";

const router = express.Router();

// router.use(verificarToken);

router.post(
  "/",
  validateBody(registrarMaquinariaSchema),
  registrarMaquinariaController,
);
router.get("/activas", getMaquinariasActivasController);
router.delete("/:id", eliminarMaquinariaController);

export default router;
