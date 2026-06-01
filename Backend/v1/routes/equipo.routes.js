import express from "express";
import {
  crearEquipoController,
  getEquiposController,
  getStatsEquiposController,
  editarEquipoController,
  trasladarEquiposAotraObraController,
} from "../controllers/equipo.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verificarToken, crearEquipoController);
router.get("/", verificarToken, getEquiposController);
router.get("/stats", verificarToken, getStatsEquiposController);
router.put("/:id", verificarToken, editarEquipoController);
router.put(
  "/trasladar/:obraId/:obraDestinoId",
  verificarToken,
  trasladarEquiposAotraObraController,
);

// Ruta alternativa que acepta POST para compatibilidad con el front
router.post(
  "/trasladar/:obraId/:obraDestinoId",
  verificarToken,
  trasladarEquiposAotraObraController,
);

export default router;
