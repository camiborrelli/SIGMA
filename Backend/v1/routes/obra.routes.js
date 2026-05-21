import express from "express";
import {
  registrarObraController,
  getObraPorIdController,
  getObrasController,
  eliminarObraController,
} from "../controllers/obra.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarObraSchema } from "../validators/obra.validators.js";

const router = express.Router();

router.get("/:id", verificarToken, getObraPorIdController);
router.get("/", verificarToken, getObrasController);
router.post(
  "/",
  verificarToken,
  validateBody(registrarObraSchema),
  registrarObraController,
);
router.delete("/:id", verificarToken, eliminarObraController);

export default router;
