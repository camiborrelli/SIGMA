import express from "express";
import {
  registrarObraController,
  getObraPorIdController,
  getObrasController,
  eliminarObraController,
  getDetalleObraController,
  finalizarObraController,
  reactivarObraController,
  cambiarNombreObraController,
} from "../controllers/obra.controller.js";
import { verificarToken } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import { registrarObraSchema } from "../validators/obra.validators.js";

const router = express.Router();

router.get("/", verificarToken, getObrasController);
router.post(
  "/",
  verificarToken,
  validateBody(registrarObraSchema),
  registrarObraController,
);
router.get("/detalle/:id", verificarToken, getDetalleObraController);
router.patch("/finalizar/:id", verificarToken, finalizarObraController);
router.get("/:id", verificarToken, getObraPorIdController);
router.delete("/:id", verificarToken, eliminarObraController);
router.patch("/reactivar/:id", verificarToken, reactivarObraController);
router.put("/editar/:id", verificarToken, cambiarNombreObraController);

export default router;
