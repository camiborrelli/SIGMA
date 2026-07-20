import express from "express";
import {
  crearEquipoController,
  getEquiposController,
  getStatsEquiposController,
  editarEquipoController,
  getEquiposPorObraController,
} from "../controllers/equipo.controller.js";
import { verificarToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verificarToken, crearEquipoController);
router.get("/", verificarToken, getEquiposController);
router.get("/obra/:obraId", verificarToken, getEquiposPorObraController);
router.get("/stats", verificarToken, getStatsEquiposController);
router.put("/:id", verificarToken, editarEquipoController);

export default router;
